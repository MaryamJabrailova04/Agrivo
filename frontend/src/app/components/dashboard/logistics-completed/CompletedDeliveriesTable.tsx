import type { CompletedDelivery } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { CompletedDeliveryRow } from "./CompletedDeliveryRow";

const TABLE_COLUMN_KEYS = [
  { key: "delivery", labelKey: "completedDeliveries.table.deliveryId", className: "agrivo-completed-table__col--delivery" },
  { key: "route", labelKey: "completedDeliveries.table.route", className: "agrivo-completed-table__col--route" },
  { key: "product", labelKey: "completedDeliveries.table.product", className: "agrivo-completed-table__col--product" },
  { key: "quantity", labelKey: "completedDeliveries.table.quantity", className: "agrivo-completed-table__col--qty" },
  { key: "driver", labelKey: "completedDeliveries.table.driver", className: "agrivo-completed-table__col--driver" },
  { key: "completed", labelKey: "completedDeliveries.table.completed", className: "agrivo-completed-table__col--completed" },
  { key: "status", labelKey: "completedDeliveries.table.statusRating", className: "agrivo-completed-table__col--status" },
  { key: "actions", labelKey: "completedDeliveries.table.action", className: "agrivo-completed-table__col--actions" },
] as const;

export function CompletedDeliveriesTable({
  deliveries,
  onView,
  onDownloadReceipt,
}: {
  deliveries: CompletedDelivery[];
  onView: (delivery: CompletedDelivery) => void;
  onDownloadReceipt?: (delivery: CompletedDelivery) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="agrivo-completed-table-wrap agrivo-dashboard-panel agrivo-completed-deliveries-table-view">
      <table className="agrivo-completed-table">
        <colgroup>
          {TABLE_COLUMN_KEYS.map((col) => (
            <col key={col.key} className={col.className} />
          ))}
        </colgroup>
        <thead className="agrivo-completed-table__head">
          <tr>
            {TABLE_COLUMN_KEYS.map((col) => (
              <th key={col.key} scope="col">
                {t(col.labelKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => (
            <CompletedDeliveryRow
              key={delivery.id}
              delivery={delivery}
              onView={onView}
              onDownloadReceipt={onDownloadReceipt}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
