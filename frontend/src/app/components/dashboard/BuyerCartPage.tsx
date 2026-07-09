import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  Info,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../context/CartContext";
import { getProductDetailHash } from "../../data/harvestExplorer";
import { placeOrdersFromCart } from "../../utils/buyerPlacedOrdersStorage";
import { isApiMode } from "../../../config/dataMode";
import {
  clearCartApi,
  getCartItemsApi,
  removeCartItemApi,
  type ApiCartItem,
  updateCartItemApi,
} from "../../../api/cartApi";
import { createOrder } from "../../../api/ordersApi";
import {
  formatQuantity,
  getCartItemSubtotal,
  getCartSummary,
  type CartItem,
} from "../../utils/cartStorage";
import { ProductImage } from "../products/ProductImage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatLocalizedQuantity,
  localizePriceUnit,
  translateBuyerProductName,
} from "../../../i18n/buyerDashboardHelpers";

function CartQuantityControl({
  item,
  onUpdate,
}: {
  item: CartItem;
  onUpdate: (slug: string, quantity: number) => void;
}) {
  const { t, language } = useLanguage();
  const [inputValue, setInputValue] = useState(String(item.selectedQuantity));
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(String(item.selectedQuantity));
    setValidationMsg(null);
  }, [item.selectedQuantity]);

  const applyQuantity = (raw: number) => {
    if (!Number.isFinite(raw)) {
      setInputValue(String(item.selectedQuantity));
      return;
    }

    const rounded = Math.round(raw);

    if (rounded > item.availableQuantity) {
      const corrected = item.availableQuantity;
      setValidationMsg(
        `${t("buyerCart.item.available")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(corrected, item.unit),
        )}`,
      );
      onUpdate(item.slug, corrected);
      setInputValue(String(corrected));
      return;
    }

    if (rounded < item.minimumOrder) {
      const corrected = item.minimumOrder;
      setValidationMsg(
        `${t("buyerCart.item.minimumOrder")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(corrected, item.unit),
        )}`,
      );
      onUpdate(item.slug, corrected);
      setInputValue(String(corrected));
      return;
    }

    setValidationMsg(null);
    onUpdate(item.slug, rounded);
    setInputValue(String(rounded));
  };

  const handleDecrement = () => {
    if (item.selectedQuantity <= item.minimumOrder) {
      setValidationMsg(
        `${t("buyerCart.item.minimumOrder")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(item.minimumOrder, item.unit),
        )}`,
      );
      return;
    }
    applyQuantity(item.selectedQuantity - 1);
  };

  const handleIncrement = () => {
    if (item.selectedQuantity >= item.availableQuantity) {
      setValidationMsg(
        `${t("buyerCart.item.available")}: ${formatLocalizedQuantity(
          t,
          language,
          formatQuantity(item.availableQuantity, item.unit),
        )}`,
      );
      return;
    }
    applyQuantity(item.selectedQuantity + 1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      setValidationMsg(null);
    }
  };

  const commitInput = () => {
    if (inputValue === "") {
      setInputValue(String(item.selectedQuantity));
      return;
    }
    applyQuantity(Number.parseInt(inputValue, 10));
  };

  return (
    <div className="agrivo-buyer-cart-item-qty-group">
      <div className="agrivo-buyer-cart-stepper">
        <button
          type="button"
          className="agrivo-buyer-cart-stepper-btn"
          aria-label={t("buyerCart.quantity.decrease", "Decrease quantity by 1")}
          onClick={handleDecrement}
          disabled={item.selectedQuantity <= item.minimumOrder}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="agrivo-buyer-cart-stepper-input"
          value={inputValue}
          aria-label={`${t("buyerCart.item.selected")} ${t("common.kg", item.unit)}`}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />
        <span className="agrivo-buyer-cart-stepper-unit">{t("common.kg", item.unit)}</span>
        <button
          type="button"
          className="agrivo-buyer-cart-stepper-btn"
          aria-label={t("buyerCart.quantity.increase", "Increase quantity by 1")}
          onClick={handleIncrement}
          disabled={item.selectedQuantity >= item.availableQuantity}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="agrivo-buyer-cart-qty-hint">
        {t("buyerCart.item.minimumOrder")}:{" "}
        {formatLocalizedQuantity(t, language, formatQuantity(item.minimumOrder, item.unit))} ·{" "}
        {t("buyerCart.item.available")}: {formatLocalizedQuantity(t, language, item.availableQuantityLabel)}
      </p>
      {validationMsg ? <p className="agrivo-buyer-cart-qty-error">{validationMsg}</p> : null}
    </div>
  );
}

function CartItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (slug: string, quantity: number) => void;
  onRemove: (slug: string) => void;
}) {
  const { t, language } = useLanguage();
  const subtotal = getCartItemSubtotal(item);
  const locationDisplay = item.location.replace(/>/g, " → ");

  return (
    <article className="agrivo-buyer-cart-item">
      <div className="agrivo-buyer-cart-item-thumb">
        <ProductImage
          name={translateBuyerProductName(t, item.name)}
          src={item.image}
          alt={translateBuyerProductName(t, item.name)}
          className="h-full w-full"
        />
      </div>

      <div className="agrivo-buyer-cart-item-main">
        <div className="agrivo-buyer-cart-item-top">
          <div className="agrivo-buyer-cart-item-info">
            <h3 className="agrivo-buyer-cart-item-name">{translateBuyerProductName(t, item.name)}</h3>
            <p className="agrivo-buyer-cart-item-farmer">
              {t("buyerCart.item.farmer")}: <strong>{item.farmer === "Farmer" ? t("buyerCart.item.farmer") : item.farmer}</strong>
            </p>
            <p className="agrivo-buyer-cart-item-location">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
              <span>{locationDisplay}</span>
            </p>
          </div>

          <div className="agrivo-buyer-cart-item-subtotal-block">
            <p className="agrivo-buyer-cart-item-subtotal-label">{t("buyerCart.item.subtotal")}</p>
            <p className="agrivo-buyer-cart-item-subtotal-value">{subtotal.toFixed(2)} AZN</p>
          </div>
        </div>

        <div className="agrivo-buyer-cart-item-details">
          <div className="agrivo-buyer-cart-item-detail">
            <span className="agrivo-buyer-cart-item-detail-label">{t("buyerCart.item.price")}</span>
            <span className="agrivo-buyer-cart-item-detail-value">
              {localizePriceUnit(t, language, item.price)}
              {item.unit ? ` / ${t("common.kg", item.unit)}` : ""}
            </span>
          </div>
          <div className="agrivo-buyer-cart-item-detail">
            <span className="agrivo-buyer-cart-item-detail-label">{t("buyerCart.item.available")}</span>
            <span className="agrivo-buyer-cart-item-detail-value">
              {formatLocalizedQuantity(t, language, item.availableQuantityLabel)}
            </span>
          </div>
          <div className="agrivo-buyer-cart-item-detail">
            <span className="agrivo-buyer-cart-item-detail-label">{t("buyerCart.item.selected")}</span>
            <span className="agrivo-buyer-cart-item-detail-value">
              {formatLocalizedQuantity(t, language, formatQuantity(item.selectedQuantity, item.unit))}
            </span>
          </div>
          <div className="agrivo-buyer-cart-item-detail">
            {item.deliveryAvailable ? (
              <span className="agrivo-buyer-cart-delivery-badge">
                <Truck className="h-3 w-3" />
                {t("buyerCart.item.deliveryAvailable")}
              </span>
            ) : (
              <span className="agrivo-buyer-cart-pickup-badge">{t("product.pickupOnly")}</span>
            )}
          </div>
        </div>

        <div className="agrivo-buyer-cart-item-controls">
          <CartQuantityControl item={item} onUpdate={onUpdate} />

          <div className="agrivo-buyer-cart-item-actions">
            <Button
              variant="outline"
              size="sm"
              className="agrivo-buyer-cart-action-btn"
              onClick={() => {
                navigateToHash(getProductDetailHash(item.slug));
              }}
            >
              {t("buyerCart.item.viewProduct")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="agrivo-buyer-cart-action-btn"
              onClick={() => {
                if (item.farmerSlug) {
                  navigateToHash(`farmers/${item.farmerSlug}`);
                } else {
                  navigateToHash("login");
                }
              }}
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              {t("buyerCart.item.contactFarmer")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="agrivo-buyer-cart-action-btn agrivo-buyer-cart-action-btn--remove"
              onClick={() => onRemove(item.slug)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              {t("buyerCart.item.remove")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderSummaryCard({
  items,
  multiFarmer,
  onCheckout,
  onContinueShopping,
}: {
  items: CartItem[];
  multiFarmer: boolean;
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  const { t } = useLanguage();
  const summary = useMemo(() => getCartSummary(items), [items]);

  return (
    <aside className="agrivo-buyer-cart-summary">
      <h3 className="agrivo-buyer-cart-summary-title">{t("buyerCart.orderSummary.title")}</h3>

      <dl className="agrivo-buyer-cart-summary-lines">
        <div className="agrivo-buyer-cart-summary-row">
          <dt>{t("buyerCart.orderSummary.items")}</dt>
          <dd>{summary.itemCount}</dd>
        </div>
        <div className="agrivo-buyer-cart-summary-row">
          <dt>{t("buyerCart.orderSummary.farmers")}</dt>
          <dd>{summary.farmerCount}</dd>
        </div>
        <div className="agrivo-buyer-cart-summary-divider" />
        <div className="agrivo-buyer-cart-summary-row">
          <dt>{t("buyerCart.orderSummary.productsSubtotal")}</dt>
          <dd>{summary.productsSubtotal.toFixed(2)} AZN</dd>
        </div>
        <div className="agrivo-buyer-cart-summary-row">
          <dt>{t("buyerCart.orderSummary.deliveryFee")}</dt>
          <dd>{summary.deliveryFee.toFixed(2)} AZN</dd>
        </div>
        <div className="agrivo-buyer-cart-summary-row">
          <dt>{t("buyerCart.orderSummary.serviceFee")}</dt>
          <dd>{summary.serviceFee.toFixed(2)} AZN</dd>
        </div>
        <div className="agrivo-buyer-cart-summary-divider" />
        <div className="agrivo-buyer-cart-summary-row agrivo-buyer-cart-summary-row--total">
          <dt>{t("buyerCart.orderSummary.total")}</dt>
          <dd>{summary.total.toFixed(2)} AZN</dd>
        </div>
      </dl>

      <div className="agrivo-buyer-cart-payment">
        <p className="agrivo-buyer-cart-payment-label">{t("buyerCart.orderSummary.paymentMethod")}</p>
        <p className="agrivo-buyer-cart-payment-value">{t("buyerCart.orderSummary.cashOnDelivery")}</p>
      </div>

      {multiFarmer ? (
        <div className="agrivo-buyer-cart-multi-note">
          <Info className="h-4 w-4 shrink-0" />
          <p>
            {t(
              "buyerCart.orderSummary.multiFarmerHint",
              "This cart includes products from multiple farmers. Delivery may be coordinated separately.",
            )}
          </p>
        </div>
      ) : null}

      <Button className="agrivo-buyer-cart-checkout-btn" onClick={onCheckout}>
        {t("buyerCart.orderSummary.proceedToCheckout")}
      </Button>
      <Button
        variant="outline"
        className="agrivo-buyer-cart-continue-btn"
        onClick={onContinueShopping}
      >
        {t("buyerCart.orderSummary.continueShopping")}
      </Button>
    </aside>
  );
}

function CheckoutDialog({
  open,
  onOpenChange,
  items,
  onPlaceOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onPlaceOrder: (details: { address: string; phone: string; note: string }) => void;
}) {
  const { t } = useLanguage();
  const summary = useMemo(() => getCartSummary(items), [items]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const canSubmit = address.trim().length > 5 && phone.trim().length >= 7;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-buyer-checkout-dialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="agrivo-heading text-xl font-bold text-[#102018]">
            {t("buyerCart.orderSummary.proceedToCheckout")}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {t(
              "buyerCart.checkout.subtitle",
              "Confirm delivery details and place your order. Payment is collected on delivery.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="checkout-address">{t("buyerCart.checkout.deliveryAddress", "Delivery address")}</Label>
            <Textarea
              id="checkout-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t("buyerCart.checkout.deliveryAddressPlaceholder", "Street, building, city")}
              className="min-h-[88px] rounded-xl border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-phone">{t("buyerCart.checkout.phoneNumber", "Phone number")}</Label>
            <Input
              id="checkout-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+994 50 000 00 00"
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-note">{t("buyerCart.checkout.deliveryNoteOptional", "Delivery note (optional)")}</Label>
            <Textarea
              id="checkout-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("buyerCart.checkout.deliveryNotePlaceholder", "Gate code, preferred delivery time, etc.")}
              className="min-h-[72px] rounded-xl border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>

          <div className="rounded-xl border border-[#edf2ea] bg-[#f8faf4] p-4 text-sm">
            <p className="font-semibold text-[#102018]">{t("buyerCart.orderSummary.paymentMethod")}</p>
            <p className="mt-1 text-[#5F6F64]">{t("buyerCart.orderSummary.cashOnDelivery")}</p>
            <p className="mt-3 font-semibold text-[#102018]">
              {t("buyerCart.checkout.orderTotal", "Order total")}:{" "}
              <span className="text-[#14532D]">{summary.total.toFixed(2)} AZN</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            disabled={!canSubmit}
            onClick={() =>
              onPlaceOrder({ address: address.trim(), phone: phone.trim(), note: note.trim() })
            }
          >
            {t("buyerCart.checkout.placeOrder", "Place Order")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CartPageStats({ itemCount, farmerCount }: { itemCount: number; farmerCount: number }) {
  const { t } = useLanguage();
  return (
    <div className="agrivo-buyer-cart-stats">
      <div className="agrivo-buyer-cart-stat">
        <Package className="h-4 w-4 text-[#43A047]" />
        <span>
          {t("buyerCart.summary.items").replace("{count}", String(itemCount))}
        </span>
      </div>
      <div className="agrivo-buyer-cart-stat">
        <Users className="h-4 w-4 text-[#43A047]" />
        <span>
          {t("buyerCart.summary.farmers").replace("{count}", String(farmerCount))}
        </span>
      </div>
      <div className="agrivo-buyer-cart-stat">
        <Truck className="h-4 w-4 text-[#43A047]" />
        <span>
          {t("buyerCart.summary.estimatedDelivery").replace("{days}", farmerCount > 1 ? "3–5" : "2–3")}
        </span>
      </div>
    </div>
  );
}

export function BuyerCartPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { cartItems, removeFromCart, updateQuantity, clearBuyerCart } = useCart();
  const [apiCartItems, setApiCartItems] = useState<CartItem[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const activeCartItems = isApiMode ? apiCartItems : cartItems;
  const summary = useMemo(() => getCartSummary(activeCartItems), [activeCartItems]);
  const multiFarmer = summary.farmerCount > 1;

  useEffect(() => {
    if (!isApiMode) return;
    let mounted = true;
    getCartItemsApi()
      .then((items) => {
        if (!mounted) return;
        setApiCartItems(items.map(mapApiCartItemToCartItem));
      })
      .catch((error) => {
        if (!mounted) return;
        setApiError(error instanceof Error ? error.message : t("buyerCart.feedback.failedLoad", "Failed to load cart."));
      });
    return () => {
      mounted = false;
    };
  }, [t]);

  const handlePlaceOrder = async (details: { address: string; phone: string; note: string }) => {
    if (!user?.id || activeCartItems.length === 0) return;
    if (isApiMode) {
      try {
        const groupedByFarmer = new Map<string, CartItem[]>();
        activeCartItems.forEach((item) => {
          const key = item.farmerSlug || item.farmer;
          const list = groupedByFarmer.get(key) ?? [];
          list.push(item);
          groupedByFarmer.set(key, list);
        });
        for (const [farmerKey, items] of groupedByFarmer.entries()) {
          await createOrder({
            farmerId: items[0].farmerSlug || farmerKey,
            deliveryMethod: "Agrivo logistics",
            deliveryAddress: `${details.address} (${details.phone})${details.note ? ` - ${details.note}` : ""}`,
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.selectedQuantity,
            })),
          });
        }
        await clearCartApi();
        setApiCartItems([]);
        setCheckoutOpen(false);
        sessionStorage.setItem("agrivo_order_success", t("buyerCart.feedback.orderPlaced", "Order placed successfully."));
        navigateToHash("dashboard/buyer/orders");
      } catch (error) {
        setApiError(error instanceof Error ? error.message : t("buyerCart.feedback.failedPlaceOrder", "Failed to place order."));
      }
      return;
    }

    placeOrdersFromCart(user.id, activeCartItems);
    clearBuyerCart();
    setCheckoutOpen(false);
    sessionStorage.setItem("agrivo_order_success", t("buyerCart.feedback.orderPlaced", "Order placed successfully."));
    navigateToHash("dashboard/buyer/orders");
  };

  if (activeCartItems.length === 0) {
    return (
      <section className="agrivo-buyer-cart">
        <div className="agrivo-dashboard-page-header">
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">{t("buyerCart.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("buyerCart.subtitle")}
          </p>
        </div>
        <div className="agrivo-buyer-cart-empty">
          <div className="agrivo-buyer-cart-empty-icon">
            <ShoppingBag className="h-7 w-7 text-[#14532D]" />
          </div>
          <h3 className="agrivo-buyer-cart-empty-title">{t("buyerCart.empty.title")}</h3>
          <p className="agrivo-buyer-cart-empty-text">
            {t("buyerCart.empty.subtitle")}
          </p>
          <Button
            className="mt-6 rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B]"
            onClick={() => {
              navigateToHash("products");
            }}
          >
            {t("buyerCart.empty.browseMarketplace")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="agrivo-buyer-cart">
      <div className="agrivo-dashboard-page-header">
        <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">{t("buyerCart.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
          {t("buyerCart.subtitle")}
        </p>
      </div>

      <CartPageStats itemCount={summary.itemCount} farmerCount={summary.farmerCount} />

      <div className="agrivo-buyer-cart-layout">
        <div className="agrivo-buyer-cart-items-col">
          <p className="agrivo-buyer-cart-items-label">
            {t("buyerCart.productsInCart").replace("{count}", String(summary.itemCount))}
          </p>
          <div className="agrivo-buyer-cart-items">
            {activeCartItems.map((item) => (
              <CartItemCard
                key={item.slug}
                item={item}
                onUpdate={(slug, quantity) => {
                  if (!isApiMode) {
                    updateQuantity(slug, quantity);
                    return;
                  }
                  const target = apiCartItems.find((i) => i.slug === slug);
                  if (!target) return;
                  updateCartItemApi(target.slug, quantity)
                    .then(() =>
                      setApiCartItems((prev) =>
                        prev.map((item) =>
                          item.slug === slug ? { ...item, selectedQuantity: quantity } : item,
                        ),
                      ),
                    )
                    .catch((error) =>
                      setApiError(error instanceof Error ? error.message : t("buyerCart.feedback.failedUpdateItem", "Failed to update cart item.")),
                    );
                }}
                onRemove={(slug) => {
                  if (!isApiMode) {
                    removeFromCart(slug);
                    return;
                  }
                  removeCartItemApi(slug)
                    .then(() =>
                      setApiCartItems((prev) => prev.filter((item) => item.slug !== slug)),
                    )
                    .catch((error) =>
                      setApiError(error instanceof Error ? error.message : t("buyerCart.feedback.failedRemoveItem", "Failed to remove cart item.")),
                    );
                }}
              />
            ))}
          </div>
        </div>

        <OrderSummaryCard
          items={activeCartItems}
          multiFarmer={multiFarmer}
          onCheckout={() => setCheckoutOpen(true)}
          onContinueShopping={() => {
            navigateToHash("products");
          }}
        />
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={activeCartItems}
        onPlaceOrder={handlePlaceOrder}
      />
      {apiError ? (
        <p className="mt-3 rounded-lg border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]">
          {apiError}
        </p>
      ) : null}
    </section>
  );
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
