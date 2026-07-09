import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateAssignedStatus } from "../../../../i18n/assignedDeliveriesHelpers";
import { type AssignedDeliveryStatus } from "../../../utils/assignedDeliveriesStorage";
import { cn } from "../../ui/utils";

const STATUS_TONES: Record<AssignedDeliveryStatus, string> = {
  assigned: "agrivo-assigned-status--assigned",
  pickup_scheduled: "agrivo-assigned-status--pickup",
  picked_up: "agrivo-assigned-status--picked",
  in_transit: "agrivo-assigned-status--transit",
  delivered: "agrivo-assigned-status--delivered",
  delayed: "agrivo-assigned-status--delayed",
  cancelled: "agrivo-assigned-status--cancelled",
};

export function DeliveryStatusBadge({
  status,
  className,
}: {
  status: AssignedDeliveryStatus;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <span className={cn("agrivo-assigned-status", STATUS_TONES[status], className)}>
      {translateAssignedStatus(t, status)}
    </span>
  );
}
