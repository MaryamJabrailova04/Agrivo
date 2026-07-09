import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateAssignedStatus } from "../../../../i18n/assignedDeliveriesHelpers";
import {
  getTimelineStepIndex,
  TIMELINE_STEPS,
  type AssignedDeliveryStatus,
} from "../../../utils/assignedDeliveriesStorage";
import { cn } from "../../ui/utils";

export function DeliveryTimeline({ status }: { status: AssignedDeliveryStatus }) {
  const { t } = useLanguage();
  const currentIndex = getTimelineStepIndex(status);
  const isCancelled = status === "cancelled";
  const timelineLabel = (step: AssignedDeliveryStatus) => {
    if (step === "in_transit") {
      return t("assignedDeliveries.timeline.inTransitStep");
    }
    return translateAssignedStatus(t, step);
  };

  return (
    <ol className="agrivo-assigned-timeline">
      {TIMELINE_STEPS.map((step, index) => {
        const isComplete = !isCancelled && index < currentIndex;
        const isCurrent = !isCancelled && index === currentIndex;
        const isUpcoming = isCancelled || index > currentIndex;

        return (
          <li
            key={step}
            className={cn(
              "agrivo-assigned-timeline__item",
              isComplete && "agrivo-assigned-timeline__item--complete",
              isCurrent && "agrivo-assigned-timeline__item--current",
              isUpcoming && "agrivo-assigned-timeline__item--upcoming",
            )}
          >
            <span className="agrivo-assigned-timeline__marker" aria-hidden>
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" strokeWidth={isCurrent ? 2.5 : 1.75} />
              )}
            </span>
            <div className="agrivo-assigned-timeline__content">
              <p className="agrivo-assigned-timeline__label">{timelineLabel(step)}</p>
              {isCurrent ? (
                <p className="agrivo-assigned-timeline__meta">
                  {t("assignedDeliveries.timeline.currentStage")}
                </p>
              ) : isComplete ? (
                <p className="agrivo-assigned-timeline__meta">
                  {t("assignedDeliveries.timeline.completed")}
                </p>
              ) : (
                <p className="agrivo-assigned-timeline__meta">
                  {t("assignedDeliveries.timeline.upcoming")}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {isCancelled ? (
        <li className="agrivo-assigned-timeline__item agrivo-assigned-timeline__item--cancelled">
          <span className="agrivo-assigned-timeline__marker" aria-hidden>
            <Circle className="h-4 w-4" />
          </span>
          <div className="agrivo-assigned-timeline__content">
            <p className="agrivo-assigned-timeline__label">
              {t("assignedDeliveries.status.cancelled")}
            </p>
            <p className="agrivo-assigned-timeline__meta">
              {t("assignedDeliveries.timeline.noLongerActive")}
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
