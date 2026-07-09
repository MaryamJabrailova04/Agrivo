import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { IN_TRANSIT_TIMELINE_STEPS, getTimelineStepIndex, type InTransitStatus } from "../../../utils/inTransitStorage";
import { translateInTransitStatus } from "../../../../i18n/inTransitHelpers";
import { cn } from "../../ui/utils";

export function TransitTimeline({ status }: { status: InTransitStatus }) {
  const { t } = useLanguage();
  const currentIndex = getTimelineStepIndex(status);
  const stepLabels = [
    t("inTransitPage.timeline.assigned"),
    t("inTransitPage.timeline.pickupScheduled"),
    t("inTransitPage.timeline.collected"),
    translateInTransitStatus(t, "in_transit"),
    translateInTransitStatus(t, "near_destination"),
    translateInTransitStatus(t, "delivered"),
  ];

  return (
    <ol className="agrivo-assigned-timeline">
      {IN_TRANSIT_TIMELINE_STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

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
              <p className="agrivo-assigned-timeline__label">{stepLabels[index] ?? step}</p>
              <p className="agrivo-assigned-timeline__meta">
                {isCurrent
                  ? t("inTransitPage.timeline.currentStage")
                  : isComplete
                    ? t("inTransitPage.timeline.completed")
                    : t("inTransitPage.timeline.upcoming")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
