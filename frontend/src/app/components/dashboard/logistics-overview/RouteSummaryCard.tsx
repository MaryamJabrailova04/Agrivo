import { useCallback, useState } from "react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLogisticsEta,
  translateLogisticsLocation,
  translateLogisticsRouteTitle,
  translateLogisticsStopLabel,
} from "../../../../i18n/logisticsDashboardHelpers";
import { RouteMap } from "../../logistics/RouteMap";
import { todayRouteData } from "../../../data/logisticsRoutes";
import type { TodayRoute } from "../../../utils/logisticsDashboardStorage";

export function RouteSummaryCard({ route }: { route: TodayRoute }) {
  const { t } = useLanguage();
  const [progressPercent, setProgressPercent] = useState(route.progressPercent);

  const handleProgressChange = useCallback((percent: number) => {
    setProgressPercent(percent);
  }, []);

  return (
    <section className="agrivo-logistics-route-summary agrivo-dashboard-panel">
      <div className="agrivo-logistics-route-summary__header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#15803d]">
            {t("logisticsDashboard.route.todaysRoute")}
          </p>
          <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018] sm:text-xl">
            {translateLogisticsRouteTitle(t, route.routeLabel)}
          </h3>
        </div>
        <span className="agrivo-logistics-route-summary__eta">
          {formatLogisticsEta(t, route.eta)}
        </span>
      </div>

      <RouteMap route={todayRouteData} onProgressChange={handleProgressChange} />

      <div className="agrivo-logistics-route-summary__meta">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {t("logisticsDashboard.route.stops")}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{route.stops}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {t("logisticsDashboard.route.distance")}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{route.distanceKm} km</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {t("logisticsDashboard.route.driver")}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{route.driverName}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {t("logisticsDashboard.route.vehicle")}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{route.vehicle}</p>
        </div>
      </div>

      <div className="agrivo-logistics-route-summary__stops">
        {route.stopLabels.map((stop) => (
          <span key={stop} className="agrivo-logistics-route-stop-chip">
            {translateLogisticsStopLabel(t, stop)}
          </span>
        ))}
      </div>

      <div className="agrivo-logistics-route-summary__progress">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#5F6F64]">
            {t("logisticsDashboard.route.routeCompletion")}
          </p>
          <p className="text-sm font-bold text-[#14532D]">{progressPercent}%</p>
        </div>
        <div className="agrivo-logistics-route-summary__progress-track">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </section>
  );
}
