import { AlertTriangle, Clock3, MapPin, Thermometer, UserCheck } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateTransitEtaAlert } from "../../../../i18n/inTransitHelpers";
import type { TransitEtaAlert } from "../../../utils/inTransitStorage";
import { cn } from "../../ui/utils";

const ALERT_ICONS = {
  delay_risk: Clock3,
  near_destination: MapPin,
  traffic: AlertTriangle,
  buyer_waiting: UserCheck,
  temperature: Thermometer,
} as const;

export function EtaAlertsCard({ alerts }: { alerts: TransitEtaAlert[] }) {
  const { t } = useLanguage();
  return (
    <section className="agrivo-transit-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("inTransitPage.sidebar.etaAlertsTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("inTransitPage.sidebar.etaAlertsSubtitle")}</p>
      <ul className="agrivo-transit-alerts-list">
        {alerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type];
          const localized = translateTransitEtaAlert(t, alert);
          return (
            <li
              key={alert.id}
              className={cn(
                "agrivo-transit-alert",
                alert.urgency === "high" ? "agrivo-transit-alert--high" : "agrivo-transit-alert--medium",
              )}
            >
              <span className="agrivo-transit-alert__icon" aria-hidden>
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
