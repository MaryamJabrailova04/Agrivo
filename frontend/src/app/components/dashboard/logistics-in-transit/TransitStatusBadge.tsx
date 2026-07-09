import {
  type InTransitStatus,
} from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateInTransitStatus } from "../../../../i18n/inTransitHelpers";
import { cn } from "../../ui/utils";

const STATUS_TONES: Record<InTransitStatus, string> = {
  in_transit: "agrivo-transit-status--transit",
  near_destination: "agrivo-transit-status--near",
  delayed: "agrivo-transit-status--delayed",
  issue_reported: "agrivo-transit-status--issue",
  delivered: "agrivo-transit-status--delivered",
};

export function TransitStatusBadge({
  status,
  className,
}: {
  status: InTransitStatus;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span className={cn("agrivo-transit-status", STATUS_TONES[status], className)}>
      {translateInTransitStatus(t, status)}
    </span>
  );
}
