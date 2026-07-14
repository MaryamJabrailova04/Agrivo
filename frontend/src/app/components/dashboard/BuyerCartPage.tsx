import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  Info,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../context/CartContext";
import { placeOrdersFromCart } from "../../utils/buyerPlacedOrdersStorage";
import { isApiMode } from "../../../config/dataMode";
import { createOrder } from "../../../api/ordersApi";
import {
  getCartSummary,
  type CartItem,
} from "../../utils/cartStorage";
import { CartProductCard } from "../cart/CartProductCard";
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
import { DeliveryMethodPicker } from "../delivery/DeliveryMethodPicker";
import type { DeliveryMethod } from "../../data/deliveryTypes";
import {
  getCartDeliveryMethod,
  getDeliveryMethodQuotes,
  setCartDeliveryMethod,
} from "../../utils/deliveryOptionsStorage";
import { createDeliveryTracking } from "../../utils/deliveryTrackingStorage";
import { translateDeliveryMethod } from "../../../i18n/deliveryHelpers";
import { AnimatePresence, motion } from "framer-motion";
import { OrderSuccessView } from "../checkout/OrderSuccessView";
import { OrderTrackingView } from "../checkout/OrderTrackingView";
import { PlaceOrderButton } from "../checkout/PlaceOrderButton";
import {
  formatDisplayOrderNumber,
  type CheckoutStep,
  type OrderConfirmationPayload,
} from "../checkout/orderConfirmationTypes";

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
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    const code = coupon.trim();
    if (!code) {
      setCouponMessage(t("buyerCart.orderSummary.couponEmpty", "Enter a coupon code."));
      return;
    }
    setCouponMessage(
      t("buyerCart.orderSummary.couponUnavailable", "This coupon code is not available yet."),
    );
  };

  return (
    <aside className="agrivo-buyer-cart-summary">
      <h3 className="agrivo-buyer-cart-summary-title">{t("buyerCart.orderSummary.title")}</h3>

      <dl className="agrivo-buyer-cart-summary-lines">
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
        <div className="agrivo-buyer-cart-summary-divider" role="presentation" />
        <div className="agrivo-buyer-cart-summary-row agrivo-buyer-cart-summary-row--total">
          <dt>{t("buyerCart.orderSummary.total")}</dt>
          <dd>{summary.total.toFixed(2)} AZN</dd>
        </div>
      </dl>

      <div className="agrivo-buyer-cart-coupon">
        <Label htmlFor="cart-coupon" className="agrivo-buyer-cart-coupon-label">
          {t("buyerCart.orderSummary.coupon", "Coupon code")}
        </Label>
        <div className="agrivo-buyer-cart-coupon-row">
          <Input
            id="cart-coupon"
            value={coupon}
            onChange={(event) => {
              setCoupon(event.target.value);
              setCouponMessage(null);
            }}
            placeholder={t("buyerCart.orderSummary.couponPlaceholder", "Enter code")}
            className="agrivo-buyer-cart-coupon-input"
          />
          <Button
            type="button"
            variant="outline"
            className="agrivo-buyer-cart-coupon-btn"
            onClick={handleApplyCoupon}
          >
            {t("buyerCart.orderSummary.applyCoupon", "Apply")}
          </Button>
        </div>
        {couponMessage ? <p className="agrivo-buyer-cart-coupon-message">{couponMessage}</p> : null}
      </div>

      <div className="agrivo-buyer-cart-payment">
        <p className="agrivo-buyer-cart-payment-label">{t("buyerCart.orderSummary.paymentMethod")}</p>
        <p className="agrivo-buyer-cart-payment-value">{t("buyerCart.orderSummary.cashOnDelivery")}</p>
      </div>

      {multiFarmer ? (
        <div className="agrivo-buyer-cart-multi-note">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
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
  onClearCartAfterSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onPlaceOrder: (details: {
    address: string;
    phone: string;
    note: string;
    deliveryMethod: DeliveryMethod;
    deliveryFee: number;
  }) => Promise<OrderConfirmationPayload | null>;
  onClearCartAfterSuccess: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const submittingRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const primaryFarmerSlug = items[0]?.farmerSlug ?? null;
  const quotes = useMemo(
    () => getDeliveryMethodQuotes("cart", primaryFarmerSlug, items.some((item) => item.deliveryAvailable)),
    [items, primaryFarmerSlug],
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(() => {
    const saved = getCartDeliveryMethod();
    if (saved && quotes.some((quote) => quote.method === saved && quote.enabled)) return saved;
    return quotes.find((quote) => quote.enabled)?.method ?? "agrivo_logistics";
  });

  useEffect(() => {
    if (deliveryMethod) setCartDeliveryMethod(deliveryMethod);
  }, [deliveryMethod]);

  const summary = useMemo(() => getCartSummary(items, deliveryMethod), [items, deliveryMethod]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("checkout");
  const [confirmation, setConfirmation] = useState<OrderConfirmationPayload | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const needsAddress = deliveryMethod !== "self_pickup";
  const canSubmit =
    Boolean(deliveryMethod) &&
    phone.trim().length >= 7 &&
    (!needsAddress || address.trim().length > 5);
  const isProcessing = checkoutStep === "processing";
  const isPostCheckout =
    checkoutStep === "success" || checkoutStep === "tracking";

  // Reset local checkout state only when the modal closes — never during submit.
  useEffect(() => {
    if (open) return;

    submittingRef.current = false;
    setCheckoutStep("checkout");
    setConfirmation(null);
    setSubmitError(null);
    setAddress("");
    setPhone("");
    setNote("");
  }, [open]);

  useLayoutEffect(() => {
    if (checkoutStep !== "success") return;
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [checkoutStep]);

  const handleContinueShopping = () => {
    onOpenChange(false);
    navigateToHash("products");
  };

  const handleViewOrders = () => {
    onOpenChange(false);
    navigateToHash("dashboard/buyer/orders");
  };

  const handleClose = () => {
    if (isProcessing) return;
    onOpenChange(false);
  };

  const handlePlaceOrderClick = () => {
    if (!deliveryMethod || checkoutStep !== "checkout") return;
    if (!canSubmit || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitError(null);
    setCheckoutStep("processing");

    void (async () => {
      try {
        const result = await onPlaceOrder({
          address: address.trim(),
          phone: phone.trim(),
          note: note.trim(),
          deliveryMethod,
          deliveryFee: summary.deliveryFee,
        });

        if (!result) {
          setCheckoutStep("checkout");
          setSubmitError(
            t("buyerCart.feedback.failedPlaceOrder", "Failed to place order."),
          );
          return;
        }

        // Success UI first — keep this modal instance mounted before clearing cart.
        setConfirmation(result);
        setCheckoutStep("success");

        try {
          await onClearCartAfterSuccess();
        } catch (clearError) {
          console.error("CLEAR CART AFTER ORDER FAILED:", clearError);
        }
      } catch (error) {
        console.error("ORDER API FAILED", error);
        setCheckoutStep("checkout");
        setSubmitError(
          error instanceof Error
            ? error.message
            : t("buyerCart.feedback.failedPlaceOrder", "Failed to place order."),
        );
        // Preserve address / phone / note / delivery method.
      } finally {
        submittingRef.current = false;
      }
    })();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isProcessing) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className={`agrivo-buyer-checkout-dialog flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[620px] ${
          isPostCheckout ? "agrivo-buyer-checkout-dialog--post" : ""
        }`}
        onInteractOutside={(event) => {
          if (isProcessing) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isProcessing) event.preventDefault();
        }}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {checkoutStep === "success" && confirmation ? (
            <motion.div
              key="success"
              ref={bodyRef}
              className="agrivo-buyer-checkout-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <OrderSuccessView
                confirmation={confirmation}
                onTrackOrder={() => setCheckoutStep("tracking")}
                onViewOrders={handleViewOrders}
                onContinueShopping={handleContinueShopping}
              />
            </motion.div>
          ) : checkoutStep === "tracking" && confirmation ? (
            <motion.div
              key="tracking"
              className="agrivo-buyer-checkout-pane"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <OrderTrackingView
                confirmation={confirmation}
                onViewOrders={handleViewOrders}
                onClose={handleClose}
                onContinueShopping={handleContinueShopping}
              />
            </motion.div>
          ) : (
            <div key="checkout" className="agrivo-buyer-checkout-shell">
              <header className="agrivo-buyer-checkout-header">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="agrivo-heading pr-8 text-xl font-bold text-[#102018]">
                    {t("buyerCart.orderSummary.proceedToCheckout")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[#5F6F64]">
                    {t(
                      "buyerCart.checkout.subtitle",
                      "Confirm delivery details and place your order. Payment is collected on delivery.",
                    )}
                  </DialogDescription>
                </DialogHeader>
              </header>

              <div className="agrivo-buyer-checkout-body">
                <div className="space-y-4">
                  <DeliveryMethodPicker
                    quotes={quotes}
                    selected={deliveryMethod}
                    onSelect={setDeliveryMethod}
                    compact
                  />

                  <div className="rounded-xl border border-[#edf2ea] bg-[#f8faf4] p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#5F6F64]">{t("delivery.products", "Products")}</span>
                      <span className="font-semibold text-[#102018]">
                        {summary.productsSubtotal.toFixed(2)} AZN
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[#5F6F64]">{t("delivery.delivery", "Delivery")}</span>
                      <span className="font-semibold text-[#102018]">
                        {summary.deliveryFee.toFixed(2)} AZN
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#e5efe1] pt-3">
                      <span className="font-semibold text-[#102018]">{t("delivery.total", "Total")}</span>
                      <span className="text-lg font-bold text-[#14532D]">
                        {summary.total.toFixed(2)} AZN
                      </span>
                    </div>
                    {deliveryMethod ? (
                      <p className="mt-2 text-xs text-[#5F6F64]">
                        {translateDeliveryMethod(t, deliveryMethod)}
                      </p>
                    ) : null}
                  </div>

                  {needsAddress ? (
                    <div className="space-y-2">
                      <Label htmlFor="checkout-address">
                        {t("buyerCart.checkout.deliveryAddress", "Delivery address")}
                      </Label>
                      <Textarea
                        id="checkout-address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder={t(
                          "buyerCart.checkout.deliveryAddressPlaceholder",
                          "Street, building, city",
                        )}
                        className="min-h-[88px] rounded-xl border-[#DEECE0] bg-[#F7FBF5]"
                        disabled={isProcessing}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#dbe7d4] bg-white p-4 text-sm text-[#5F6F64]">
                      <p className="font-semibold text-[#14532D]">
                        {t("delivery.methods.self_pickup.title", "Self Pickup")}
                      </p>
                      <p className="mt-1">
                        {t(
                          "buyerCart.checkout.pickupHint",
                          "Collect at the farm during pickup hours. Your pickup code will appear after placing the order.",
                        )}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="checkout-phone">
                      {t("buyerCart.checkout.phoneNumber", "Phone number")}
                    </Label>
                    <Input
                      id="checkout-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+994 50 000 00 00"
                      className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-note">
                      {t("buyerCart.checkout.deliveryNoteOptional", "Delivery note (optional)")}
                    </Label>
                    <Textarea
                      id="checkout-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder={t(
                        "buyerCart.checkout.deliveryNotePlaceholder",
                        "Gate code, preferred delivery time, etc.",
                      )}
                      className="min-h-[72px] rounded-xl border-[#DEECE0] bg-[#F7FBF5]"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="rounded-xl border border-[#edf2ea] bg-[#f8faf4] p-4 text-sm">
                    <p className="font-semibold text-[#102018]">
                      {t("buyerCart.orderSummary.paymentMethod")}
                    </p>
                    <p className="mt-1 text-[#5F6F64]">{t("buyerCart.orderSummary.cashOnDelivery")}</p>
                  </div>

                  {submitError ? (
                    <p className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm text-[#b91c1c]">
                      {submitError}
                    </p>
                  ) : null}
                </div>
              </div>

              <footer className="agrivo-buyer-checkout-footer">
                <DialogFooter className="gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    {t("common.cancel")}
                  </Button>
                  <PlaceOrderButton
                    disabled={!canSubmit || !deliveryMethod}
                    processing={isProcessing}
                    idleLabel={t("buyerCart.checkout.placeOrder", "Place Order")}
                    processingLabel={t(
                      "buyerCart.checkout.placingOrder",
                      "Placing Order...",
                    )}
                    onPlaceOrder={handlePlaceOrderClick}
                  />
                </DialogFooter>
              </footer>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function CartPageStats({ itemCount, farmerCount }: { itemCount: number; farmerCount: number }) {
  const { t } = useLanguage();
  const deliveryLabel = t("buyerCart.summary.estimatedDelivery").replace(
    "{days}",
    farmerCount > 1 ? "3–5" : "2–3",
  );

  return (
    <div className="agrivo-buyer-cart-stats">
      <div className="agrivo-buyer-cart-stat">
        <span className="agrivo-buyer-cart-stat-icon" aria-hidden="true">
          <Package className="h-4 w-4" />
        </span>
        <div className="agrivo-buyer-cart-stat-copy">
          <p className="agrivo-buyer-cart-stat-label">{t("buyerCart.orderSummary.items")}</p>
          <p className="agrivo-buyer-cart-stat-value">{itemCount}</p>
        </div>
      </div>
      <div className="agrivo-buyer-cart-stat">
        <span className="agrivo-buyer-cart-stat-icon" aria-hidden="true">
          <Users className="h-4 w-4" />
        </span>
        <div className="agrivo-buyer-cart-stat-copy">
          <p className="agrivo-buyer-cart-stat-label">{t("buyerCart.orderSummary.farmers")}</p>
          <p className="agrivo-buyer-cart-stat-value">{farmerCount}</p>
        </div>
      </div>
      <div className="agrivo-buyer-cart-stat">
        <span className="agrivo-buyer-cart-stat-icon" aria-hidden="true">
          <Truck className="h-4 w-4" />
        </span>
        <div className="agrivo-buyer-cart-stat-copy">
          <p className="agrivo-buyer-cart-stat-label">
            {t("buyerCart.summary.deliveryLabel", "Delivery")}
          </p>
          <p className="agrivo-buyer-cart-stat-value agrivo-buyer-cart-stat-value--text">{deliveryLabel}</p>
        </div>
      </div>
    </div>
  );
}

export function BuyerCartPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { cartItems, removeFromCart, updateQuantity, clearBuyerCart } = useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const summary = useMemo(() => getCartSummary(cartItems), [cartItems]);
  const multiFarmer = summary.farmerCount > 1;

  const handlePlaceOrder = async (details: {
    address: string;
    phone: string;
    note: string;
    deliveryMethod: DeliveryMethod;
    deliveryFee: number;
  }): Promise<OrderConfirmationPayload | null> => {
    // Use the immutable checkout snapshot — never depend on live cart during submit.
    const orderItems = checkoutItems;
    if (!user?.id || orderItems.length === 0) return null;

    const buildConfirmation = (
      orderId: string,
      totalPaid: number,
      farmerName: string,
    ): OrderConfirmationPayload => {
      const methodLabel = translateDeliveryMethod(t, details.deliveryMethod);
      const deliveryAddress =
        details.deliveryMethod === "self_pickup"
          ? t("buyerCart.confirmation.farmPickup", "Farm pickup location")
          : details.address || t("buyerCart.confirmation.deliveryAddressFallback", "Delivery address");

      return {
        orderNumber: orderId,
        displayOrderNumber: formatDisplayOrderNumber(orderId),
        totalPaid,
        paymentLabel: t("buyerCart.orderSummary.cashOnDelivery"),
        deliveryAddress,
        farmerLabel:
          details.deliveryMethod === "farmer_delivery"
            ? methodLabel
            : farmerName || methodLabel,
        deliveryMethodLabel: methodLabel,
        etaLabel: t("buyerCart.confirmation.etaToday", "Today • 30–45 min"),
        primaryOrderId: orderId,
      };
    };

    if (isApiMode) {
      const cartSummary = getCartSummary(orderItems, details.deliveryMethod);
      const groupedByFarmer = new Map<string, CartItem[]>();
      orderItems.forEach((item) => {
        const key = item.farmerSlug || item.farmer;
        const list = groupedByFarmer.get(key) ?? [];
        list.push(item);
        groupedByFarmer.set(key, list);
      });
      let primaryOrderId = "";
      let primaryFarmer = orderItems[0]?.farmer ?? "Farmer";
      let placedTotal = cartSummary.total;
      for (const [, farmerItems] of groupedByFarmer.entries()) {
        const farmerId = farmerItems[0].farmerSlug;
        if (!farmerId) {
          throw new Error(
            t(
              "buyerCart.feedback.missingFarmer",
              "One or more products are missing farmer information.",
            ),
          );
        }

        const orderPayload = {
          farmerId,
          deliveryMethod: details.deliveryMethod,
          deliveryFee: details.deliveryFee,
          deliveryAddress:
            details.deliveryMethod === "self_pickup"
              ? `Self pickup (${details.phone})${details.note ? ` - ${details.note}` : ""}`
              : `${details.address} (${details.phone})${details.note ? ` - ${details.note}` : ""}`,
          items: farmerItems.map((item) => ({
            productId: item.id,
            quantity: Number(item.selectedQuantity),
          })),
        };

        const order = await createOrder(orderPayload);
        placedTotal = Number(order.totalAmount ?? placedTotal);
        if (!primaryOrderId) {
          primaryOrderId = order.id;
          primaryFarmer = farmerItems[0].farmer;
        }
        createDeliveryTracking({
          orderId: order.id,
          method: details.deliveryMethod,
          deliveryFee: order.deliveryFee ?? details.deliveryFee,
          farmerSlug: farmerItems[0].farmerSlug,
        });
      }

      // Do NOT clear cart here — clearing would remount empty-cart UI and wipe the modal.
      sessionStorage.setItem(
        "agrivo_order_success",
        t("buyerCart.feedback.orderPlaced", "Order placed successfully."),
      );
      return buildConfirmation(
        primaryOrderId || `AGR-${Date.now().toString().slice(-4)}`,
        placedTotal,
        primaryFarmer,
      );
    }

    const cartSummary = getCartSummary(orderItems, details.deliveryMethod);
    const created = placeOrdersFromCart(user.id, orderItems, {
      deliveryMethod: details.deliveryMethod,
      deliveryFee: details.deliveryFee,
      address: details.address,
      phone: details.phone,
      note: details.note,
    });
    created.forEach((order) => {
      createDeliveryTracking({
        orderId: order.orderId,
        method: details.deliveryMethod,
        deliveryFee: details.deliveryFee,
        farmerSlug: orderItems.find((item) => item.name === order.product)?.farmerSlug,
      });
    });

    sessionStorage.setItem(
      "agrivo_order_success",
      t("buyerCart.feedback.orderPlaced", "Order placed successfully."),
    );

    const primary = created[0];
    if (!primary) return null;
    return buildConfirmation(primary.orderId, cartSummary.total, primary.farmer);
  };

  const handleClearCartAfterSuccess = async () => {
    await clearBuyerCart();
  };

  const checkoutDialog = (
    <CheckoutDialog
      open={checkoutOpen}
      onOpenChange={(open) => {
        setCheckoutOpen(open);
        if (!open) {
          setCheckoutItems([]);
          setCheckoutError(null);
        }
      }}
      items={checkoutItems}
      onPlaceOrder={handlePlaceOrder}
      onClearCartAfterSuccess={handleClearCartAfterSuccess}
    />
  );

  return (
    <section className="agrivo-buyer-cart">
      <div className="agrivo-dashboard-page-header">
        <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">{t("buyerCart.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
          {t("buyerCart.subtitle")}
        </p>
      </div>

      {cartItems.length === 0 ? (
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
      ) : (
        <>
          <CartPageStats itemCount={summary.itemCount} farmerCount={summary.farmerCount} />

          <div className="agrivo-buyer-cart-layout">
            <div className="agrivo-buyer-cart-items-col">
              <p className="agrivo-buyer-cart-items-label">
                {t("buyerCart.productsInCart").replace("{count}", String(summary.itemCount))}
              </p>
              <div className="agrivo-buyer-cart-items">
                {cartItems.map((item) => (
                  <CartProductCard
                    key={item.slug}
                    item={item}
                    onUpdate={(slug, quantity) => {
                      updateQuantity(slug, quantity);
                    }}
                    onRemove={(slug) => {
                      removeFromCart(slug);
                    }}
                  />
                ))}
              </div>
            </div>

            <OrderSummaryCard
              items={cartItems}
              multiFarmer={multiFarmer}
              onCheckout={() => {
                setCheckoutItems(cartItems.map((item) => ({ ...item })));
                setCheckoutOpen(true);
              }}
              onContinueShopping={() => {
                navigateToHash("products");
              }}
            />
          </div>
        </>
      )}

      {checkoutDialog}

      {checkoutError ? (
        <p className="mt-3 rounded-lg border border-[#fecaca] bg-[#fff1f2] p-3 text-sm text-[#b91c1c]">
          {checkoutError}
        </p>
      ) : null}
    </section>
  );
}
