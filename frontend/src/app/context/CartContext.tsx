import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { getProductBySlug, type HarvestListing } from "../data/harvestExplorer";
import { isApiMode } from "../../config/dataMode";
import {
  addCartItemApi,
  clearCartApi,
  getCartItemsApi,
  removeCartItemApi,
  type ApiCartItem,
  updateCartItemApi,
} from "../../api/cartApi";
import {
  addOrUpdateCartItem,
  cartItemFromListing,
  cartItemFromSavedProduct,
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  CART_CHANGED_EVENT,
  notifyCartChanged,
  type CartItem,
} from "../utils/cartStorage";
import type { SavedProduct } from "../utils/savedProductsStorage";
import { useLanguage } from "../../i18n/LanguageContext";

export type CartAddOutcome = "added" | "quantity_updated" | "already_at_max";

export type CartActionResult =
  | { ok: true; message: string; count: number; outcome: CartAddOutcome }
  | { ok: false; message: string };

interface CartToast {
  message: string;
  variant: "success" | "error";
}

interface CartContextValue {
  cartItems: CartItem[];
  /** Total selected quantity across all cart lines. */
  cartCount: number;
  isCartLoading: boolean;
  addListingToCart: (listing: HarvestListing) => CartActionResult;
  addSavedToCart: (product: SavedProduct) => CartActionResult;
  addSlugToCart: (slug: string) => CartActionResult;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearBuyerCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toast: CartToast | null;
  showCartToast: (message: string, variant?: "success" | "error") => void;
  isInCart: (slug: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function getTotalQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => total + Number(item.selectedQuantity || 0), 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const outcomeMessages = useMemo<Record<CartAddOutcome, string>>(
    () => ({
      added: t("marketplace.card.addedToCart", "Product added to cart"),
      quantity_updated: t("buyerCart.feedback.quantityUpdated", "Quantity updated"),
      already_at_max: t("marketplace.card.inCart", "This product is already in your cart"),
    }),
    [t],
  );

  const [toast, setToast] = useState<CartToast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const refreshCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      setIsCartLoading(false);
      return;
    }

    setIsCartLoading(true);
    try {
      if (isApiMode) {
        const items = await getCartItemsApi();
        setCartItems(items.map(mapApiCartItemToCartItem));
      } else {
        setCartItems(getCartItems(user.id));
      }
    } catch {
      setCartItems([]);
    } finally {
      setIsCartLoading(false);
    }
  }, [user?.id]);

  // Drop previous user's in-memory cart as soon as auth user changes.
  useEffect(() => {
    setCartItems([]);
    setIsCartLoading(Boolean(user?.id));
  }, [user?.id]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const handleChange = () => {
      void refreshCart();
    };
    window.addEventListener(CART_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refreshCart]);

  const showCartToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, variant });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const guardBuyer = useCallback((): CartActionResult | null => {
    if (!isAuthenticated || !user) {
      return { ok: false, message: t("auth.loginAsBuyerToAddToCart", "Please log in as a buyer to add items to cart.") };
    }
    if (user.role !== "buyer") {
      return { ok: false, message: t("auth.onlyBuyersCanAddToCart", "Only buyers can add products to cart.") };
    }
    return null;
  }, [isAuthenticated, t, user]);

  const runGuarded = useCallback(
    (action: () => CartActionResult): CartActionResult => {
      const blocked = guardBuyer();
      if (blocked) {
        showCartToast(blocked.message, "error");
        return blocked;
      }
      try {
        return action();
      } catch {
        const failure: CartActionResult = {
          ok: false,
          message: t("marketplace.card.failedAdd", "Could not add product to cart. Please try again."),
        };
        showCartToast(failure.message, "error");
        return failure;
      }
    },
    [guardBuyer, showCartToast, t],
  );

  const processAdd = useCallback(
    (base: Omit<CartItem, "selectedQuantity" | "addedAt">): CartActionResult => {
      if (isApiMode) {
        addCartItemApi(base.id, base.minimumOrder)
          .then((item) =>
            setCartItems((prev) => {
              const mapped = mapApiCartItemToCartItem(item);
              const existing = prev.find((i) => i.slug === mapped.slug);
              if (existing) {
                return prev.map((i) => (i.slug === mapped.slug ? mapped : i));
              }
              return [mapped, ...prev];
            }),
          )
          .then(() => notifyCartChanged())
          .catch(() => showCartToast(t("marketplace.card.failedAdd", "Could not add product to cart. Please try again."), "error"));
        const message = outcomeMessages.added;
        showCartToast(message, "success");
        return { ok: true, message, count: getTotalQuantity(cartItems) + base.minimumOrder, outcome: "added" };
      }
      const { items, outcome } = addOrUpdateCartItem(user!.id, base);
      setCartItems(items);
      const message = outcomeMessages[outcome];
      showCartToast(message, outcome === "already_at_max" ? "error" : "success");
      return { ok: true, message, count: getTotalQuantity(items), outcome };
    },
    [cartItems, outcomeMessages, showCartToast, t, user],
  );

  const addListingToCart = useCallback(
    (listing: HarvestListing): CartActionResult =>
      runGuarded(() => processAdd(cartItemFromListing(listing))),
    [processAdd, runGuarded],
  );

  const addSavedToCart = useCallback(
    (product: SavedProduct): CartActionResult =>
      runGuarded(() => processAdd(cartItemFromSavedProduct(product))),
    [processAdd, runGuarded],
  );

  const addSlugToCart = useCallback(
    (slug: string): CartActionResult => {
      const listing = getProductBySlug(slug);
      if (!listing) {
        const failure: CartActionResult = {
          ok: false,
          message: t("marketplace.card.failedAdd", "Could not add product to cart. Please try again."),
        };
        showCartToast(failure.message, "error");
        return failure;
      }
      return addListingToCart(listing);
    },
    [addListingToCart, showCartToast, t],
  );

  const removeFromCart = useCallback(
    (slug: string) => {
      if (!user?.id) return;
      if (isApiMode) {
        setCartItems((prev) => prev.filter((item) => item.slug !== slug));
        removeCartItemApi(slug)
          .then(() => {
            notifyCartChanged();
            showCartToast(t("buyerCart.feedback.productRemoved", "Product removed from cart"));
          })
          .catch(() => {
            void refreshCart();
            showCartToast(t("buyerCart.feedback.failedRemoveItem", "Could not remove item from cart."), "error");
          });
        return;
      }
      const next = removeCartItem(user.id, slug);
      setCartItems(next);
      showCartToast(t("buyerCart.feedback.productRemoved", "Product removed from cart"));
    },
    [refreshCart, showCartToast, t, user?.id],
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      if (!user?.id) return;
      if (isApiMode) {
        setCartItems((prev) =>
          prev.map((entry) =>
            entry.slug === slug ? { ...entry, selectedQuantity: quantity } : entry,
          ),
        );
        updateCartItemApi(slug, quantity)
          .then((item) => {
            setCartItems((prev) =>
              prev.map((entry) => (entry.slug === slug ? mapApiCartItemToCartItem(item) : entry)),
            );
            notifyCartChanged();
            showCartToast(t("buyerCart.feedback.quantityUpdated", "Quantity updated"));
          })
          .catch(() => {
            void refreshCart();
            showCartToast(t("buyerCart.feedback.failedUpdateItem", "Could not update cart item."), "error");
          });
        return;
      }
      const next = updateCartItemQuantity(user.id, slug, quantity);
      setCartItems(next);
      showCartToast(t("buyerCart.feedback.quantityUpdated", "Quantity updated"));
    },
    [refreshCart, showCartToast, t, user?.id],
  );

  const clearBuyerCart = useCallback(async () => {
    if (!user?.id) return;

    // Keep UI + badge in sync immediately.
    setCartItems([]);

    if (isApiMode) {
      try {
        // Clear backend first so any refreshCart triggered by storage notify sees [].
        await clearCartApi();
      } catch {
        showCartToast(t("buyerCart.feedback.failedClear", "Could not clear cart."), "error");
        await refreshCart();
        return;
      }
    }

    // Mock persist clear + wipe any user-scoped localStorage residue in API mode.
    clearCart(user.id);
  }, [refreshCart, showCartToast, t, user?.id]);

  const isInCart = useCallback(
    (slug: string) => cartItems.some((item) => item.slug === slug),
    [cartItems],
  );

  const cartCount = useMemo(() => getTotalQuantity(cartItems), [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      isCartLoading,
      addListingToCart,
      addSavedToCart,
      addSlugToCart,
      removeFromCart,
      updateQuantity,
      clearBuyerCart,
      refreshCart,
      toast,
      showCartToast,
      isInCart,
    }),
    [
      cartItems,
      cartCount,
      isCartLoading,
      addListingToCart,
      addSavedToCart,
      addSlugToCart,
      removeFromCart,
      updateQuantity,
      clearBuyerCart,
      refreshCart,
      toast,
      showCartToast,
      isInCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className={`agrivo-cart-toast agrivo-cart-toast--${toast.variant}`}
          role="status"
          aria-live="polite"
        >
          {toast.variant === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function mapApiCartItemToCartItem(item: ApiCartItem): CartItem {
  const unit = item.product.unit || "kg";
  const quantity = item.product.quantity ?? 0;
  const pricePerUnit = item.product.price ?? 0;
  const location = `${item.product.region ?? "Azerbaijan"} > ${item.product.district ?? "District"}${
    item.product.village ? ` > ${item.product.village}` : ""
  }`;
  return {
    id: item.product.id,
    slug: item.id,
    name: item.product.name,
    category: item.product.category,
    image: item.product.imageUrl ?? "",
    farmer: item.product.farmer?.name ?? "Farmer",
    farmerSlug: item.product.farmer?.id ?? null,
    location,
    price: `${pricePerUnit} AZN`,
    unit,
    availableQuantity: quantity,
    availableQuantityLabel: `${quantity} ${unit}`,
    selectedQuantity: item.quantity,
    deliveryAvailable: true,
    minimumOrder: 1,
    step: 1,
    pricePerUnit,
    addedAt: new Date().toISOString(),
  };
}
