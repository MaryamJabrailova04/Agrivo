import type { PerformanceSummary } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";

export function PerformanceSummaryCard({ summary }: { summary: PerformanceSummary }) {
  const { t } = useLanguage();
  const rows = [
    {
      label: t("completedDeliveries.sidebar.onTimeRate"),
      value: `${summary.onTimeRate}%`,
      width: summary.onTimeRate,
    },
    {
      label: t("completedDeliveries.sidebar.issueRate"),
      value: `${summary.issueRate}%`,
      width: summary.issueRate,
    },
  ];

  return (
    <section className="agrivo-completed-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("completedDeliveries.sidebar.performanceSummaryTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">
        {t("completedDeliveries.sidebar.performanceSummarySubtitle")}
      </p>

      <dl className="agrivo-completed-metrics">
        <div>
          <dt>{t("completedDeliveries.sidebar.averageDuration")}</dt>
          <dd>{summary.averageDuration}</dd>
        </div>
        <div>
          <dt>{t("completedDeliveries.sidebar.completedDeliveries")}</dt>
          <dd>{summary.totalCompleted}</dd>
        </div>
      </dl>

      <div className="agrivo-completed-progress-bars">
        {rows.map((row) => (
          <div key={row.label} className="agrivo-completed-progress-row">
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
