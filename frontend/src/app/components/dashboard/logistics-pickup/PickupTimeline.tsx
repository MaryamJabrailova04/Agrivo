import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupStatus } from "../../../../i18n/pickupTasksHelpers";
import {
  PICKUP_TIMELINE_STEPS,
  getPickupTimelineIndex,
  type PickupTaskStatus,
} from "../../../utils/pickupTasksStorage";
import { cn } from "../../ui/utils";

export function PickupTimeline({ status }: { status: PickupTaskStatus }) {
  const { t } = useLanguage();
  const currentIndex = getPickupTimelineIndex(status);
  const isCancelled = status === "cancelled";
  const isDelayed = status === "delayed";

  const steps = [...PICKUP_TIMELINE_STEPS, "in_transit" as const];
  const stepLabels = [
    ...PICKUP_TIMELINE_STEPS.map((step) =>
      step === "collected" ? t("pickupTasks.timeline.collected") : translatePickupStatus(t, step),
    ),
    t("pickupTasks.timeline.movedToInTransit"),
  ];

  return (
    <ol className="agrivo-assigned-timeline">
      {steps.map((step, index) => {
        const isComplete = !isCancelled && index < currentIndex;
        const isCurrent =
          !isCancelled &&
          (index === currentIndex || (isDelayed && step === "pickup_started"));
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
              <p className="agrivo-assigned-timeline__label">{stepLabels[index]}</p>
              <p className="agrivo-assigned-timeline__meta">
                {isCurrent
                  ? t("pickupTasks.timeline.currentStage")
                  : isComplete
                    ? t("pickupTasks.timeline.completed")
                    : t("pickupTasks.timeline.upcoming")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
