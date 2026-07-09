import {
  type PickupTaskStatus,
} from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupStatus } from "../../../../i18n/pickupTasksHelpers";
import { cn } from "../../ui/utils";

const STATUS_TONES: Record<PickupTaskStatus, string> = {
  scheduled: "agrivo-pickup-status--scheduled",
  ready_for_pickup: "agrivo-pickup-status--ready",
  driver_assigned: "agrivo-pickup-status--assigned",
  pickup_started: "agrivo-pickup-status--started",
  collected: "agrivo-pickup-status--collected",
  delayed: "agrivo-pickup-status--delayed",
  cancelled: "agrivo-pickup-status--cancelled",
};

export function PickupStatusBadge({
  status,
  className,
}: {
  status: PickupTaskStatus;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span className={cn("agrivo-pickup-status", STATUS_TONES[status], className)}>
      {translatePickupStatus(t, status)}
    </span>
  );
}
