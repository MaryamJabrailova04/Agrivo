import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { COMPLETED_TIMELINE_STEPS } from "../../../utils/completedDeliveriesStorage";

export function CompletedDeliveryTimeline() {
  const { t } = useLanguage();
  const stepLabels = [
    t("completedDeliveries.timeline.assigned"),
    t("completedDeliveries.timeline.pickupScheduled"),
    t("completedDeliveries.timeline.collected"),
    t("completedDeliveries.timeline.inTransit"),
    t("completedDeliveries.timeline.nearDestination"),
    t("completedDeliveries.timeline.delivered"),
  ];

  return (
    <ol className="agrivo-assigned-timeline">
      {COMPLETED_TIMELINE_STEPS.map((step, index) => {
        const isComplete = index < COMPLETED_TIMELINE_STEPS.length - 1;
        const isCurrent = index === COMPLETED_TIMELINE_STEPS.length - 1;

        return (
          <li
            key={step}
            className={`agrivo-assigned-timeline__item ${
              isComplete ? "agrivo-assigned-timeline__item--complete" : ""
            } ${isCurrent ? "agrivo-assigned-timeline__item--current" : ""}`}
          >
            <span className="agrivo-assigned-timeline__marker" aria-hidden>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="agrivo-assigned-timeline__content">
              <p className="agrivo-assigned-timeline__label">{stepLabels[index] ?? step}</p>
              <p className="agrivo-assigned-timeline__meta">
                {isCurrent
                  ? t("completedDeliveries.timeline.finalStage")
                  : t("completedDeliveries.timeline.completed")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
