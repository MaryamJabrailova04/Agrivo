import {
  type PickupPriority,
} from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupPriority } from "../../../../i18n/pickupTasksHelpers";
import { cn } from "../../ui/utils";

const PRIORITY_TONES: Record<PickupPriority, string> = {
  high: "agrivo-pickup-priority--high",
  medium: "agrivo-pickup-priority--medium",
  low: "agrivo-pickup-priority--low",
};

export function PickupPriorityBadge({
  priority,
  className,
}: {
  priority: PickupPriority;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span className={cn("agrivo-pickup-priority", PRIORITY_TONES[priority], className)}>
      {translatePickupPriority(t, priority)}
    </span>
  );
}
