import { ArrowRight } from "lucide-react";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateAssignedDateLabel,
  translateAssignedLocation,
  translateAssignedProduct,
  translateAssignedVariety,
} from "../../../../i18n/assignedDeliveriesHelpers";
import {
  formatAssignedQuantity,
  type AssignedDelivery,
  type AssignedDeliveryAction,
} from "../../../utils/assignedDeliveriesStorage";
import { DeliveryCardActions } from "./DeliveryCardActions";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { PriorityBadge } from "./PriorityBadge";

interface AssignedDeliveryCardProps {
  delivery: AssignedDelivery;
  onAction: (delivery: AssignedDelivery, action: AssignedDeliveryAction) => void;
}

export function AssignedDeliveryCard({ delivery, onAction }: AssignedDeliveryCardProps) {
  const { t, language } = useLanguage();

  return (
    <article className="agrivo-assigned-card">
      <div className="agrivo-assigned-card__top">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {delivery.taskId}
            </p>
            <PriorityBadge priority={delivery.priority} />
          </div>
          <p className="mt-1 text-xs text-[#6b7a70]">
            {translateAssignedDateLabel(t, delivery.assignedAt)}
          </p>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div className="agrivo-assigned-card__route">
        <h3 className="agrivo-heading flex flex-wrap items-center gap-1.5 text-base font-bold text-[#102018] sm:text-lg">
          <span>
            {translateAssignedLocation(
              t,
              delivery.pickupLocation,
              language,
              delivery.pickupLocationLocalized,
            )}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#43A047]" />
          <span>
            {translateAssignedLocation(
              t,
              delivery.dropoffLocation,
              language,
              delivery.dropoffLocationLocalized,
            )}
          </span>
        </h3>
      </div>

      <dl className="agrivo-assigned-card__details">
        <div>
          <dt>{t("assignedDeliveries.columns.farmer")}</dt>
          <dd>{delivery.farmerName}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.buyer")}</dt>
          <dd>{delivery.buyerName}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.product")}</dt>
          <dd>{translateAssignedProduct(t, language, delivery)}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.sort")}</dt>
          <dd>
            <ProductVarietyBadge
              variety={translateAssignedVariety(t, language, delivery.variety, delivery.sortKey)}
              showLabel={false}
              size="sm"
            />
          </dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.quantity")}</dt>
          <dd>{formatAssignedQuantity(delivery)}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.pickup")}</dt>
          <dd>{delivery.pickupTime}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.eta")}</dt>
          <dd>{delivery.eta}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.driver")}</dt>
          <dd>{delivery.driverName}</dd>
        </div>
        <div>
          <dt>{t("assignedDeliveries.columns.vehicle")}</dt>
          <dd>{delivery.vehicle}</dd>
        </div>
      </dl>

      <DeliveryCardActions delivery={delivery} onAction={onAction} />
    </article>
  );
}
