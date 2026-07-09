import { ClipboardList, MapPinPlus } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatLogisticsTaskCount } from "../../../../i18n/logisticsDashboardHelpers";

export function LogisticsOverviewMainGrid({ children }: { children: ReactNode }) {
  return <div className="agrivo-logistics-overview-grid">{children}</div>;
}

export function LogisticsOverviewLeftColumn({ children }: { children: ReactNode }) {
  return <div className="agrivo-logistics-overview-left">{children}</div>;
}

export function LogisticsOverviewRightColumn({ children }: { children: ReactNode }) {
  return <div className="agrivo-logistics-overview-right">{children}</div>;
}

export function DeliveryTasksCard({
  children,
  taskCount,
}: {
  children: ReactNode;
  taskCount: number;
}) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-logistics-tasks-card agrivo-dashboard-panel">
      <div className="agrivo-logistics-tasks-card__header">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#43A047]" />
          <h3 className="agrivo-heading text-lg font-bold text-[#102018]">
            {t("logisticsDashboard.tasks.activeDeliveryTasks")}
          </h3>
        </div>
        <p className="text-sm text-[#6b7a70]">{formatLogisticsTaskCount(t, taskCount)}</p>
      </div>
      {children}
    </section>
  );
}

export function DeliveryTasksEmptyState({ onAssignPickup }: { onAssignPickup: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="agrivo-dashboard-empty agrivo-logistics-tasks-empty">
      <MapPinPlus className="h-10 w-10 text-[#86efac]" strokeWidth={1.5} />
      <h4 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">
        {t("logisticsDashboard.tasks.emptyTitle")}
      </h4>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
        {t("logisticsDashboard.tasks.emptyDescription")}
      </p>
      <button
        type="button"
        className="agrivo-button-soft mt-5 rounded-full bg-[#14532D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D6A3B]"
        onClick={onAssignPickup}
      >
        {t("logisticsDashboard.actions.assignPickup")}
      </button>
    </div>
  );
}
