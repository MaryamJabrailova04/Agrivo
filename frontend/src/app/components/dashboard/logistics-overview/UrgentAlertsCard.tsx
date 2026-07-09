import { AlertTriangle, Clock3, MapPin, MessageSquareWarning } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateUrgentAlert } from "../../../../i18n/logisticsDashboardHelpers";
import type { UrgentAlert } from "../../../utils/logisticsDashboardStorage";
import { cn } from "../../ui/utils";

const ALERT_ICONS = {
  delayed: AlertTriangle,
  route_changed: MapPin,
  confirmation: MessageSquareWarning,
  deadline: Clock3,
};

export function UrgentAlertsCard({ alerts }: { alerts: UrgentAlert[] }) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-logistics-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("logisticsDashboard.alerts.title")}
      </h3>
      <ul className="agrivo-logistics-alerts-list mt-3">
        {alerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type];
          const localized = translateUrgentAlert(t, alert);
          return (
            <li
              key={alert.id}
              className={cn(
                "agrivo-logistics-alert-item",
                alert.urgency === "high" && "agrivo-logistics-alert-item--high",
              )}
            >
              <span className="agrivo-logistics-alert-icon">
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
