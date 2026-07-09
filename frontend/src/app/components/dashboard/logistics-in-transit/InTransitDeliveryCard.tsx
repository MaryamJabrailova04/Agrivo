import { ArrowRight, AlertTriangle } from "lucide-react";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateInTransitLocation,
  translateInTransitProduct,
  translateInTransitVariety,
} from "../../../../i18n/inTransitHelpers";
import {
  formatTransitQuantity,
  type InTransitDelivery,
  type InTransitAction,
} from "../../../utils/inTransitStorage";
import { EtaBadge } from "./EtaBadge";
import { TransitCardActions } from "./TransitCardActions";
import { TransitStatusBadge } from "./TransitStatusBadge";

export function InTransitDeliveryCard({
  delivery,
  onAction,
}: {
  delivery: InTransitDelivery;
  onAction: (delivery: InTransitDelivery, action: InTransitAction) => void;
}) {
  const { t, language } = useLanguage();
  return (
    <article className="agrivo-transit-card">
      <div className="agrivo-transit-card__top">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
            {delivery.taskId}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <TransitStatusBadge status={delivery.status} />
          <EtaBadge eta={delivery.eta} etaStatus={delivery.etaStatus} />
          {delivery.etaStatus === "delay_risk" ? (
            <span className="agrivo-transit-delay-risk">
              <AlertTriangle className="h-3 w-3" />
              {t("inTransitPage.sidebar.etaDelayRisk")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="agrivo-transit-card__route">
        <h3 className="agrivo-heading flex flex-wrap items-center gap-1.5 text-base font-bold text-[#102018] sm:text-lg">
          <span>
            {translateInTransitLocation(
              t,
              delivery.pickupLocation,
              language,
              delivery.pickupLocationLocalized,
            )}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#43A047]" />
          <span>
            {translateInTransitLocation(
              t,
              delivery.dropoffLocation,
              language,
              delivery.dropoffLocationLocalized,
            )}
          </span>
        </h3>
      </div>

      <dl className="agrivo-transit-card__details">
        <div>
          <dt>{t("inTransitPage.columns.driver")}</dt>
          <dd>{delivery.driverName}</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.vehicle")}</dt>
          <dd>{delivery.vehicle}</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.product")}</dt>
          <dd>{translateInTransitProduct(t, language, delivery)}</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.sort")}</dt>
          <dd>
            <ProductVarietyBadge
              variety={translateInTransitVariety(t, language, delivery.variety, delivery.sortKey)}
              showLabel={false}
              size="sm"
            />
          </dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.quantity")}</dt>
          <dd>{formatTransitQuantity(delivery)}</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.currentLocation")}</dt>
          <dd>
            {translateInTransitLocation(
              t,
              delivery.currentLocation,
              language,
              delivery.currentLocationLocalized,
            )}
          </dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.distanceRemaining")}</dt>
          <dd>{delivery.distanceRemaining}</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.columns.progress")}</dt>
          <dd>{delivery.progress}%</dd>
        </div>
      </dl>

      <div className="agrivo-transit-card__progress">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#5F6F64]">
            {t("inTransitPage.columns.routeProgress")}
          </p>
          <p className="text-sm font-bold text-[#14532D]">{delivery.progress}%</p>
        </div>
        <div className="agrivo-transit-card__progress-track">
          <span style={{ width: `${delivery.progress}%` }} />
        </div>
      </div>

      {delivery.issue ? (
        <p className="agrivo-transit-card__issue">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {delivery.issue}
        </p>
      ) : null}

      <TransitCardActions delivery={delivery} onAction={onAction} />
    </article>
  );
}
