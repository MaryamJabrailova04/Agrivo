import type { TransitDriver } from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatDriverRouteLabel, translateInTransitDriverStatus } from "../../../../i18n/inTransitHelpers";
import { cn } from "../../ui/utils";

const DOT_TONES: Record<TransitDriver["statusTone"], string> = {
  active: "agrivo-transit-driver-dot--active",
  near: "agrivo-transit-driver-dot--near",
  delayed: "agrivo-transit-driver-dot--delayed",
  issue: "agrivo-transit-driver-dot--issue",
};

export function ActiveDriversCard({ drivers }: { drivers: TransitDriver[] }) {
  const { t, language } = useLanguage();
  return (
    <section className="agrivo-transit-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("inTransitPage.sidebar.activeDriversTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("inTransitPage.sidebar.activeDriversSubtitle")}</p>
      <ul className="agrivo-transit-drivers-list">
        {drivers.map((driver) => (
          <li key={driver.id} className="agrivo-transit-driver-item">
            <span className={cn("agrivo-transit-driver-dot", DOT_TONES[driver.statusTone])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#102018]">{driver.name}</p>
              <p className="text-xs text-[#5F6F64]">{driver.vehicle}</p>
              <p className="mt-0.5 text-xs font-medium text-[#14532D]">
                {translateInTransitDriverStatus(t, driver.status)} — {formatDriverRouteLabel(t, driver, language)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
