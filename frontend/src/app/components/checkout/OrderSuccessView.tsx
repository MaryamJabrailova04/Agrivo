import { MapPin } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { Button } from "../ui/button";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import type { OrderConfirmationPayload } from "./orderConfirmationTypes";
import { SuccessCheckmark } from "./SuccessCheckmark";

interface OrderSuccessViewProps {
  confirmation: OrderConfirmationPayload;
  onTrackOrder: () => void;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export function OrderSuccessView({
  confirmation,
  onTrackOrder,
  onViewOrders,
  onContinueShopping,
}: OrderSuccessViewProps) {
  const { t } = useLanguage();

  const rows = [
    {
      label: t("buyerCart.confirmation.orderNumber", "Order number"),
      value: confirmation.displayOrderNumber || confirmation.orderNumber || "—",
    },
    {
      label: t("buyerCart.confirmation.total", "Total"),
      value: `${Number(confirmation.totalPaid || 0).toFixed(2)} AZN`,
      emphasize: true,
    },
    {
      label: t("buyerCart.confirmation.delivery", "Delivery"),
      value: confirmation.deliveryMethodLabel || confirmation.farmerLabel || "—",
    },
    {
      label: t("buyerCart.confirmation.estimatedDelivery", "Estimated delivery"),
      value: confirmation.etaLabel || "—",
    },
    {
      label: t("buyerCart.confirmation.deliveryAddress", "Delivery address"),
      value: confirmation.deliveryAddress || "—",
      isAddress: true,
    },
  ];

  return (
    <div className="agrivo-order-success">
      <DialogTitle className="sr-only">
        {t("buyerCart.confirmation.title", "Order Confirmed")}
      </DialogTitle>
      <DialogDescription className="sr-only">
        {t(
          "buyerCart.confirmation.subtitle",
          "Your order has been successfully placed.",
        )}
      </DialogDescription>

      <SuccessCheckmark compact />

      <div className="agrivo-order-success-copy">
        <h2 className="agrivo-order-success-title">
          {t("buyerCart.confirmation.title", "Order Confirmed")}
        </h2>
        <p className="agrivo-order-success-subtitle">
          {t(
            "buyerCart.confirmation.subtitle",
            "Your order has been successfully placed.",
          )}
        </p>
      </div>

      <div className="agrivo-order-success-card">
        <dl className="agrivo-order-success-card-rows">
          {rows.map((row) => (
            <div key={row.label} className="agrivo-order-success-card-row">
              <dt>{row.label}</dt>
              <dd className={row.emphasize ? "agrivo-order-success-card-row--total" : undefined}>
                {row.isAddress ? (
                  <span className="agrivo-order-success-address">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {row.value}
                  </span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="agrivo-order-success-actions">
        <Button
          type="button"
          className="agrivo-order-success-btn agrivo-order-success-btn--primary"
          onClick={onTrackOrder}
        >
          {t("buyerCart.confirmation.trackOrder", "Track Order")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="agrivo-order-success-btn agrivo-order-success-btn--secondary"
          onClick={onViewOrders}
        >
          {t("buyerCart.confirmation.viewOrders", "View My Orders")}
        </Button>
        <button
          type="button"
          className="agrivo-order-success-link"
          onClick={onContinueShopping}
        >
          {t("buyerCart.confirmation.continueShopping", "Continue Shopping")}
        </button>
      </div>
    </div>
  );
}
