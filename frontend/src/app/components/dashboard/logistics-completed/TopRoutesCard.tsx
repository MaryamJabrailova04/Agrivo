import { Route } from "lucide-react";
import type { TopRoute } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateTopRoute } from "../../../../i18n/completedDeliveriesHelpers";

export function TopRoutesCard({ routes }: { routes: TopRoute[] }) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-completed-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("completedDeliveries.sidebar.topRoutesTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("completedDeliveries.sidebar.topRoutesSubtitle")}</p>
      <ul className="agrivo-completed-routes-list">
        {routes.map((route) => (
          <li key={route.id} className="agrivo-completed-route-item">
            <Route className="h-4 w-4 shrink-0 text-[#43A047]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#102018]">{translateTopRoute(t, route)}</p>
              <p className="text-xs text-[#5F6F64]">
                {t("completedDeliveries.sidebar.deliveriesCount", { count: route.count })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
