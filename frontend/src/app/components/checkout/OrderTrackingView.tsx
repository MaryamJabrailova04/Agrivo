import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle, Tractor } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { Button } from "../ui/button";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import type { OrderConfirmationPayload } from "./orderConfirmationTypes";

type TrackingStepStatus = "complete" | "current" | "upcoming";

interface OrderTrackingViewProps {
  confirmation: OrderConfirmationPayload;
  onViewOrders: () => void;
  onClose: () => void;
  onContinueShopping: () => void;
}

export function OrderTrackingView({
  confirmation,
  onViewOrders,
  onClose,
  onContinueShopping,
}: OrderTrackingViewProps) {
  const { t } = useLanguage();

  const steps: Array<{ id: string; label: string; status: TrackingStepStatus }> = [
    {
      id: "received",
      label: t("buyerCart.tracking.orderReceived", "Order Received"),
      status: "complete",
    },
    {
      id: "preparing",
      label: t("buyerCart.tracking.preparing", "Preparing"),
      status: "current",
    },
    {
      id: "on_the_way",
      label: t("buyerCart.tracking.onTheWay", "On the Way"),
      status: "upcoming",
    },
    {
      id: "delivered",
      label: t("buyerCart.tracking.delivered", "Delivered"),
      status: "upcoming",
    },
  ];

  return (
    <div className="agrivo-order-tracking">
      <DialogTitle className="sr-only">
        {t("buyerCart.tracking.farmerPreparing", "Farmer preparing your order")}
      </DialogTitle>
      <DialogDescription className="sr-only">
        {confirmation.displayOrderNumber}
      </DialogDescription>

      <div className="agrivo-order-tracking-banner">
        <span className="agrivo-order-tracking-banner-icon" aria-hidden="true">
          <Tractor className="h-5 w-5" />
        </span>
        <div>
          <p className="agrivo-order-tracking-banner-title">
            {t("buyerCart.tracking.farmerPreparing", "Farmer preparing your order")}
          </p>
          <p className="agrivo-order-tracking-banner-meta">
            {confirmation.displayOrderNumber}
            {confirmation.etaLabel ? ` · ${confirmation.etaLabel}` : ""}
          </p>
        </div>
      </div>

      <div
        className="agrivo-order-tracking-progress"
        aria-label={t("buyerCart.tracking.timeline", "Order progress")}
      >
        {steps.map((step, index) => (
          <div key={step.id} className="agrivo-order-tracking-step">
            <div className="agrivo-order-tracking-step-rail">
              <span
                className={`agrivo-order-tracking-step-dot agrivo-order-tracking-step-dot--${step.status}`}
              >
                {step.status === "complete" ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : step.status === "current" ? (
                  <motion.span
                    className="agrivo-order-tracking-pulse-dot"
                    animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <Circle className="h-3 w-3" aria-hidden="true" />
                )}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={`agrivo-order-tracking-step-line ${
                    step.status === "complete" ? "agrivo-order-tracking-step-line--done" : ""
                  }`}
                />
              ) : null}
            </div>
            <div className="agrivo-order-tracking-step-copy">
              <p
                className={`agrivo-order-tracking-step-label ${
                  step.status !== "upcoming" ? "agrivo-order-tracking-step-label--active" : ""
                }`}
              >
                {step.label}
              </p>
              <AnimatePresence>
                {step.status === "current" ? (
                  <motion.p
                    className="agrivo-order-tracking-step-hint"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {t(
                      "buyerCart.tracking.preparingHint",
                      "Fresh harvest is being packed for delivery.",
                    )}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="agrivo-order-tracking-summary">
        <div className="agrivo-order-tracking-summary-row">
          <span>{t("buyerCart.confirmation.total", "Total")}</span>
          <strong>{Number(confirmation.totalPaid || 0).toFixed(2)} AZN</strong>
        </div>
        <div className="agrivo-order-tracking-summary-row">
          <span>{t("buyerCart.confirmation.delivery", "Delivery")}</span>
          <strong>{confirmation.deliveryMethodLabel || "—"}</strong>
        </div>
        <div className="agrivo-order-tracking-summary-row">
          <span>{t("buyerCart.confirmation.farmer", "Farmer")}</span>
          <strong>{confirmation.farmerLabel || "—"}</strong>
        </div>
      </div>

      <div className="agrivo-order-success-actions">
        <Button
          type="button"
          className="agrivo-order-success-btn agrivo-order-success-btn--primary"
          onClick={onViewOrders}
        >
          {t("buyerCart.confirmation.viewOrders", "View My Orders")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="agrivo-order-success-btn agrivo-order-success-btn--secondary"
          onClick={onClose}
        >
          {t("common.close", "Close")}
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
