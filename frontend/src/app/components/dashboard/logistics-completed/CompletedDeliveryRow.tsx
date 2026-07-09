import {
  formatCompletedQuantity,
  type CompletedDelivery,
} from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateCompletedTime } from "../../../../i18n/completedDeliveriesHelpers";
import { DeliveryActionsCell } from "./DeliveryActionsCell";
import { ProductCell } from "./ProductCell";
import { RouteCell } from "./RouteCell";
import { StatusRatingCell } from "./StatusRatingCell";

export function CompletedDeliveryRow({
  delivery,
  onView,
  onDownloadReceipt,
}: {
  delivery: CompletedDelivery;
  onView: (delivery: CompletedDelivery) => void;
  onDownloadReceipt?: (delivery: CompletedDelivery) => void;
}) {
  const { t } = useLanguage();

  return (
    <tr className="agrivo-completed-table__row">
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--id">
        <span className="agrivo-completed-table__delivery-id">{delivery.taskId}</span>
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--route">
        <RouteCell delivery={delivery} />
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--product">
        <ProductCell delivery={delivery} />
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--qty">
        <span className="agrivo-completed-table__qty">{formatCompletedQuantity(delivery)}</span>
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--driver">
        {delivery.driverName}
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--completed">
        <span className="agrivo-completed-table__completed-time">
          {translateCompletedTime(t, delivery.completedAt)}
        </span>
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--status">
        <StatusRatingCell delivery={delivery} />
      </td>
      <td className="agrivo-completed-table__cell agrivo-completed-table__cell--actions">
        <DeliveryActionsCell
          delivery={delivery}
          onView={onView}
          onDownloadReceipt={onDownloadReceipt}
        />
      </td>
    </tr>
  );
}
