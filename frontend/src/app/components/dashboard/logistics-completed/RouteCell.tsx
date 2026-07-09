import {
  formatRoute,
  truncateText,
  type CompletedDelivery,
} from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatCompletedRouteLabel } from "../../../../i18n/completedDeliveriesHelpers";

export function RouteCell({ delivery }: { delivery: CompletedDelivery }) {
  const { t, language } = useLanguage();
  const { pickup, dropoff } = formatRoute(delivery.pickupLocation, delivery.dropoffLocation);
  const fullRoute = formatCompletedRouteLabel(t, delivery, language);
  const localizedPickup = delivery.pickupLocationLocalized?.[language] ?? pickup;
  const localizedDropoff = delivery.dropoffLocationLocalized?.[language] ?? dropoff;

  return (
    <div className="agrivo-completed-route-cell" title={fullRoute}>
      <span className="agrivo-completed-route-cell__line agrivo-completed-route-cell__pickup">
        {truncateText(localizedPickup, 34)}
      </span>
      <span className="agrivo-completed-route-cell__line agrivo-completed-route-cell__dropoff">
        <span className="agrivo-completed-route-cell__arrow" aria-hidden>
          →
        </span>
        {truncateText(localizedDropoff, 32)}
      </span>
    </div>
  );
}
