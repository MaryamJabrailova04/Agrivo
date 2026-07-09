import {
  formatCompletedQuantity,
  type CompletedDelivery,
} from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateCompletedProduct,
  translateCompletedTime,
  translateCompletedVariety,
} from "../../../../i18n/completedDeliveriesHelpers";
import { Button } from "../../ui/button";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { CompletionStatusBadge } from "./CompletionStatusBadge";
import { RatingDisplay } from "./RatingDisplay";
import { RouteCell } from "./RouteCell";

export function CompletedDeliveryCard({
  delivery,
  onView,
}: {
  delivery: CompletedDelivery;
  onView: (delivery: CompletedDelivery) => void;
}) {
  const { t, language } = useLanguage();

  return (
    <article className="agrivo-completed-card">
      <div className="agrivo-completed-card__top">
        <p className="agrivo-completed-card__id">{delivery.taskId}</p>
        <CompletionStatusBadge status={delivery.status} short />
      </div>

      <div className="agrivo-completed-card__route">
        <RouteCell delivery={delivery} />
      </div>

      <div className="agrivo-completed-card__product">
        <p className="agrivo-completed-card__product-name">
          {translateCompletedProduct(t, language, delivery)}
        </p>
        <ProductVarietyBadge
          variety={translateCompletedVariety(t, language, delivery.variety, delivery.sortKey)}
          showLabel={false}
          size="sm"
          compact
        />
      </div>

      <dl className="agrivo-completed-card__meta agrivo-completed-card__meta--compact">
        <div>
          <dt>{t("completedDeliveries.table.quantity")}</dt>
          <dd>{formatCompletedQuantity(delivery)}</dd>
        </div>
        <div>
          <dt>{t("completedDeliveries.table.driver")}</dt>
          <dd>{delivery.driverName}</dd>
        </div>
        <div>
          <dt>{t("completedDeliveries.table.completed")}</dt>
          <dd>{translateCompletedTime(t, delivery.completedAt)}</dd>
        </div>
        <div>
          <dt>{t("completedDeliveries.sidebar.ratingLabel")}</dt>
          <dd>
            <RatingDisplay rating={delivery.rating} showEmpty />
          </dd>
        </div>
      </dl>

      <Button
        type="button"
        size="sm"
        className="agrivo-completed-card__action mt-3 w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
        onClick={() => onView(delivery)}
      >
        {t("completedDeliveries.actions.viewDetails")}
      </Button>
    </article>
  );
}
