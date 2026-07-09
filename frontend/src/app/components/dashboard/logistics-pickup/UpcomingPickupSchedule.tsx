import type { PickupTask } from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupProduct } from "../../../../i18n/pickupTasksHelpers";
import { PickupStatusBadge } from "./PickupStatusBadge";

export function UpcomingPickupSchedule({ tasks }: { tasks: PickupTask[] }) {
  const { t, language } = useLanguage();

  return (
    <section className="agrivo-pickup-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("pickupTasks.sidebar.upcomingPickupsTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">
        {t("pickupTasks.sidebar.upcomingPickupsSubtitle")}
      </p>

      <ul className="agrivo-pickup-schedule-list">
        {tasks.map((task) => (
          <li key={task.id} className="agrivo-pickup-schedule-item">
            <div className="agrivo-pickup-schedule-item__time">{task.pickupTime}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#102018]">{task.farmerName}</p>
              <p className="truncate text-xs text-[#5F6F64]">
                {translatePickupProduct(t, language, task)}
              </p>
            </div>
            <PickupStatusBadge status={task.status} className="shrink-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}
