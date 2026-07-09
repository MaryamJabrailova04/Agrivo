import type { CompletionStatus } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateCompletedStatus } from "../../../../i18n/completedDeliveriesHelpers";
import { cn } from "../../ui/utils";

const STATUS_TONES: Record<CompletionStatus, string> = {
  completed_on_time: "agrivo-completed-status--ontime",
  completed_late: "agrivo-completed-status--late",
  completed_with_issue: "agrivo-completed-status--issue",
};

export function CompletionStatusBadge({
  status,
  className,
  short = false,
}: {
  status: CompletionStatus;
  className?: string;
  short?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <span className={cn("agrivo-completed-status", STATUS_TONES[status], className)}>
      {translateCompletedStatus(t, status, short)}
    </span>
  );
}
