import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateTrackingStep } from "../../../i18n/deliveryHelpers";
import type { TrackingEvent } from "../../data/deliveryTypes";
import { cn } from "../ui/utils";

interface DeliveryTrackingTimelineProps {
  events: TrackingEvent[];
  className?: string;
}

export function DeliveryTrackingTimeline({ events, className }: DeliveryTrackingTimelineProps) {
  const { t } = useLanguage();

  return (
    <ol className={cn("agrivo-delivery-timeline", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            className={cn(
              "agrivo-delivery-timeline__item",
              event.complete && "agrivo-delivery-timeline__item--complete",
              event.current && "agrivo-delivery-timeline__item--current",
            )}
          >
            <div className="agrivo-delivery-timeline__marker" aria-hidden="true">
              {event.complete || event.current ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
              {!isLast ? <span className="agrivo-delivery-timeline__line" /> : null}
            </div>
            <div className="agrivo-delivery-timeline__content">
              <p className="text-sm font-semibold text-[#102018]">
                {translateTrackingStep(t, event.stepId)}
              </p>
              {event.current ? (
                <p className="mt-0.5 text-xs font-medium text-[#14532D]">
                  {t("delivery.timeline.current", "Current status")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
