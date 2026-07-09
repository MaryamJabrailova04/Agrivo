import { AlertTriangle, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupAlert } from "../../../../i18n/pickupTasksHelpers";
import type { PickupAlert } from "../../../utils/pickupTasksStorage";
import { cn } from "../../ui/utils";

const ALERT_ICONS = {
  delay: Clock3,
  early_arrival: MapPin,
  no_driver: Truck,
  ready_now: PackageCheck,
  road_issue: AlertTriangle,
} as const;

export function UrgentPickupAlerts({ alerts }: { alerts: PickupAlert[] }) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-pickup-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("pickupTasks.sidebar.urgentAlertsTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">
        {t("pickupTasks.sidebar.urgentAlertsSubtitle")}
      </p>

      <ul className="agrivo-pickup-alerts-list">
        {alerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type];
          const localized = translatePickupAlert(t, alert);
          return (
            <li
              key={alert.id}
              className={cn(
                "agrivo-pickup-alert",
                alert.urgency === "high"
                  ? "agrivo-pickup-alert--high"
                  : "agrivo-pickup-alert--medium",
              )}
            >
              <span className="agrivo-pickup-alert__icon" aria-hidden>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#102018]">{localized.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-[#5F6F64]">{localized.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
