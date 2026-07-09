import { Eye, Truck, UserRound } from "lucide-react";
import {
  formatOrderCurrency,
  formatOrderQuantity,
  type FarmerManagementOrder,
  type FarmerManagementOrderStatus,
} from "../../../utils/farmerOrdersStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  getLocalizedOrderProductName,
  getLocalizedOrderVariety,
  getPrimaryOrderAction,
  translateFarmerOrderDelivery,
  translateOrderDateLabel,
} from "../../../../i18n/farmerOrderHelpers";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { Button } from "../../ui/button";
import { FarmerMgmtOrderStatusBadge } from "./FarmerMgmtOrderStatusBadge";

interface OrderCardProps {
  order: FarmerManagementOrder;
  onViewDetails: (order: FarmerManagementOrder) => void;
  onStatusChange: (orderId: string, status: FarmerManagementOrderStatus) => void;
  onReject: (order: FarmerManagementOrder) => void;
}

export function OrderCard({ order, onViewDetails, onStatusChange, onReject }: OrderCardProps) {
  const { t, language } = useLanguage();
  const primaryAction = getPrimaryOrderAction(order.status, t);
  const productName = getLocalizedOrderProductName(order, language, t);
  const variety = getLocalizedOrderVariety(order, language);

  return (
    <article className="agrivo-farmer-order-card agrivo-card">
      <div className="agrivo-farmer-order-card__header">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
            {t("farmerOrders.labels.orderId")}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-[#102018]">{order.orderId}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <FarmerMgmtOrderStatusBadge status={order.status} />
          <p className="text-xs text-[#6b7a70]">{translateOrderDateLabel(t, order.orderDateLabel)}</p>
        </div>
      </div>

      <div className="agrivo-farmer-order-card__body">
        <div className="agrivo-farmer-order-card__buyer">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5]">
            <UserRound className="h-4 w-4 text-[#14532D]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#102018]">{order.buyerName}</p>
            <p className="text-xs text-[#6b7a70]">{order.buyerType}</p>
          </div>
        </div>

        <div className="agrivo-farmer-order-card__product">
          <div className="agrivo-product-title-block !mt-0">
            <p className="text-sm font-semibold text-[#102018]">{productName}</p>
            <ProductVarietyBadge variety={variety} label={t("farmerOrders.labels.sort")} />
          </div>
        </div>

        <dl className="agrivo-farmer-order-card__meta">
          <div>
            <dt>{t("farmerOrders.labels.quantity")}</dt>
            <dd>{formatOrderQuantity(order)}</dd>
          </div>
          <div>
            <dt>{t("farmerOrders.labels.totalPrice")}</dt>
            <dd>{formatOrderCurrency(order.totalPrice)}</dd>
          </div>
          <div className="agrivo-farmer-order-card__meta-delivery">
            <dt>
              <Truck className="h-3.5 w-3.5" aria-hidden />
              {t("farmerOrders.labels.delivery")}
            </dt>
            <dd>{translateFarmerOrderDelivery(t, order.deliveryMethod)}</dd>
          </div>
        </dl>
      </div>

      <div className="agrivo-farmer-order-card__actions">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={() => onViewDetails(order)}
        >
          <Eye className="mr-2 h-4 w-4" />
          {t("farmerOrders.actions.viewDetails")}
        </Button>

        {primaryAction ? (
          <Button
            type="button"
            className="agrivo-button-soft rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={() => onStatusChange(order.id, primaryAction.nextStatus)}
          >
            {primaryAction.label}
          </Button>
        ) : null}

        {order.status === "pending" ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]"
            onClick={() => onReject(order)}
          >
            {t("farmerOrders.actions.reject")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
