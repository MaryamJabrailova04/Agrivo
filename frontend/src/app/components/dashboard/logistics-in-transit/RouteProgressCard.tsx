import type { RouteProgressSummary } from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";

export function RouteProgressCard({ summary }: { summary: RouteProgressSummary }) {
  const { t } = useLanguage();
  const rows = [
    {
      label: t("inTransitPage.sidebar.averageCompletion"),
      value: `${summary.averageCompletion}%`,
      width: summary.averageCompletion,
    },
    { label: t("inTransitPage.sidebar.onTimeRate"), value: `${summary.onTimeRate}%`, width: summary.onTimeRate },
  ];

  return (
    <section className="agrivo-transit-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("inTransitPage.sidebar.routeProgressTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("inTransitPage.sidebar.routeProgressSubtitle")}</p>

      <dl className="agrivo-transit-progress-metrics">
        <div>
          <dt>{t("inTransitPage.sidebar.remainingDistance")}</dt>
          <dd>{summary.totalRemainingDistance} km</dd>
        </div>
        <div>
          <dt>{t("inTransitPage.sidebar.activeRoutes")}</dt>
          <dd>{summary.activeRoutes}</dd>
        </div>
      </dl>

      <div className="agrivo-transit-progress-bars">
        {rows.map((row) => (
          <div key={row.label} className="agrivo-transit-progress-row">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#33443a]">{row.label}</p>
              <p className="text-sm font-bold text-[#14532D]">{row.value}</p>
            </div>
            <div className="agrivo-transit-card__progress-track">
              <span style={{ width: `${row.width}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
