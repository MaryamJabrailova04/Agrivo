import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateAssignedPriority } from "../../../../i18n/assignedDeliveriesHelpers";
import { type AssignedDeliveryPriority } from "../../../utils/assignedDeliveriesStorage";
import { cn } from "../../ui/utils";

const PRIORITY_TONES: Record<AssignedDeliveryPriority, string> = {
  high: "agrivo-assigned-priority--high",
  medium: "agrivo-assigned-priority--medium",
  low: "agrivo-assigned-priority--low",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: AssignedDeliveryPriority;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <span className={cn("agrivo-assigned-priority", PRIORITY_TONES[priority], className)}>
      {translateAssignedPriority(t, priority)}
    </span>
  );
}
