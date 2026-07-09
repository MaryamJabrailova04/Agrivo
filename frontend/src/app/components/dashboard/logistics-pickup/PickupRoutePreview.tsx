import { Navigation, Route } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupLocation } from "../../../../i18n/pickupTasksHelpers";

export function PickupRoutePreview() {
  const { t, language } = useLanguage();

  return (
    <section className="agrivo-pickup-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("pickupTasks.sidebar.nextRouteTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("pickupTasks.sidebar.nextRouteSubtitle")}</p>

      <div className="agrivo-pickup-route-preview">
        <div className="agrivo-pickup-route-preview__line" />
        <div className="agrivo-pickup-route-preview__stops">
          <div className="agrivo-pickup-route-preview__stop">
            <span className="agrivo-pickup-route-preview__dot agrivo-pickup-route-preview__dot--active" />
            <div>
              <p className="text-xs font-semibold text-[#14532D]">
                {t("pickupTasks.sidebar.nextStop")}
              </p>
              <p className="text-sm font-bold text-[#102018]">
                {translatePickupLocation(t, "Lankaran Greenhouse", language)}
              </p>
              <p className="text-xs text-[#5F6F64]">
                09:30 · {t("pickupTasks.products.tomato")}
              </p>
            </div>
          </div>
          <div className="agrivo-pickup-route-preview__stop">
            <span className="agrivo-pickup-route-preview__dot" />
            <div>
              <p className="text-sm font-semibold text-[#102018]">
                {translatePickupLocation(t, "Masalli Pickup Point", language)}
              </p>
              <p className="text-xs text-[#5F6F64]">11:00 · {t("pickupTasks.products.apple")}</p>
            </div>
          </div>
          <div className="agrivo-pickup-route-preview__stop">
            <span className="agrivo-pickup-route-preview__dot" />
            <div>
              <p className="text-sm font-semibold text-[#102018]">
                {translatePickupLocation(t, "Baku Market", language)}
              </p>
              <p className="text-xs text-[#5F6F64]">{t("pickupTasks.sidebar.hubDropoff")}</p>
            </div>
          </div>
        </div>
        <div className="agrivo-pickup-route-preview__footer">
          <Route className="h-4 w-4 text-[#43A047]" />
          <span>{t("pickupTasks.sidebar.routePreviewPath")}</span>
          <Navigation className="h-3.5 w-3.5 text-[#6b7a70]" />
        </div>
      </div>
    </section>
  );
}
