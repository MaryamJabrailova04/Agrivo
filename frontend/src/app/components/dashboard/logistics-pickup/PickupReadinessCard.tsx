import type { PickupReadinessSummary } from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupReadiness } from "../../../../i18n/pickupTasksHelpers";

const READINESS_ITEMS = [
  { key: "readyNow", readiness: "ready_now", color: "#16a34a" },
  { key: "packingInProgress", readiness: "packing", color: "#0e7490" },
  { key: "waitingForDriver", readiness: "waiting_driver", color: "#b45309" },
  { key: "delayedReadiness", readiness: "delayed", color: "#c2410c" },
] as const;

export function PickupReadinessCard({ summary }: { summary: PickupReadinessSummary }) {
  const { t } = useLanguage();
  const total = Math.max(
    1,
    summary.readyNow +
      summary.packingInProgress +
      summary.waitingForDriver +
      summary.delayedReadiness,
  );

  return (
    <section className="agrivo-pickup-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("pickupTasks.sidebar.pickupReadinessTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">
        {t("pickupTasks.sidebar.pickupReadinessSubtitle")}
      </p>

      <dl className="agrivo-pickup-readiness-grid">
        {READINESS_ITEMS.map((item) => {
          const value = summary[item.key];
          return (
            <div key={item.key} className="agrivo-pickup-readiness-item">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-xs font-semibold text-[#33443a]">
                  {translatePickupReadiness(t, item.readiness)}
                </dt>
                <dd className="text-sm font-bold text-[#102018]">{value}</dd>
              </div>
              <div className="agrivo-pickup-readiness-track">
                <span
                  style={{
                    width: `${(value / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
