import { BarChart3, Clock3, Star, TrendingUp } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { LogisticsPerformance } from "../../../utils/logisticsDashboardStorage";

export function PerformanceSummaryCard({ performance }: { performance: LogisticsPerformance }) {
  const { t } = useLanguage();

  const metrics = [
    {
      labelKey: "logisticsDashboard.performance.onTimeRate",
      value: `${performance.onTimeRate}%`,
      icon: TrendingUp,
      progress: performance.onTimeRate,
    },
    {
      labelKey: "logisticsDashboard.performance.avgDeliveryTime",
      value: performance.avgDeliveryTime,
      icon: Clock3,
    },
    {
      labelKey: "logisticsDashboard.performance.completedThisWeek",
      value: String(performance.completedThisWeek),
      icon: BarChart3,
    },
    {
      labelKey: "logisticsDashboard.performance.successRate",
      value: `${performance.successRate}%`,
      icon: Star,
      progress: performance.successRate,
    },
  ];

  return (
    <section className="agrivo-logistics-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("logisticsDashboard.performance.title")}
      </h3>
      <div className="agrivo-logistics-performance mt-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.labelKey} className="agrivo-logistics-performance-item">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="agrivo-logistics-performance-icon">
                    <Icon className="h-3.5 w-3.5 text-[#14532D]" />
                  </span>
                  <p className="text-xs font-medium text-[#5F6F64]">{t(metric.labelKey)}</p>
                </div>
                <p className="text-sm font-bold text-[#102018]">{metric.value}</p>
              </div>
              {metric.progress !== undefined ? (
                <div className="agrivo-logistics-performance-bar">
                  <span style={{ width: `${metric.progress}%` }} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
