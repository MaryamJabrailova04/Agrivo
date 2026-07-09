import { CheckCircle2, Info, MapPin, RefreshCw, Route, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  translatePickupAction,
  translatePickupStatus,
} from "../../../i18n/pickupTasksHelpers";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  applyPickupTaskAction,
  computePickupReadinessSummary,
  computePickupTaskSummary,
  filterPickupTasks,
  getLogisticsSectionHash,
  getPickupTasks,
  getPickupTaskRegions,
  getUpcomingPickups,
  resolvePickupTasksUserId,
  seedPickupAlerts,
  type PickupPriorityFilter,
  type PickupStatusFilter,
  type PickupTask,
  type PickupTaskAction,
  type PickupTimeFilter,
} from "../../utils/pickupTasksStorage";
import { Button } from "../ui/button";
import { PickupDetailsModal } from "./logistics-pickup/PickupDetailsModal";
import { PickupFilterBar } from "./logistics-pickup/PickupFilterBar";
import { PickupReadinessCard } from "./logistics-pickup/PickupReadinessCard";
import { PickupRouteModal } from "./logistics-pickup/PickupRouteModal";
import { PickupRoutePreview } from "./logistics-pickup/PickupRoutePreview";
import { PickupStats } from "./logistics-pickup/PickupStats";
import { PickupTaskCard } from "./logistics-pickup/PickupTaskCard";
import { UrgentPickupAlerts } from "./logistics-pickup/UrgentPickupAlerts";
import { UpcomingPickupSchedule } from "./logistics-pickup/UpcomingPickupSchedule";

function navigate(hash: string) {
  navigateToHash(hash);
}

export function PickupTasksPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolvePickupTasksUserId(user);

  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PickupStatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<PickupTimeFilter>("today");
  const [region, setRegion] = useState("all");
  const [priority, setPriority] = useState<PickupPriorityFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<PickupTask | null>(null);
  const [routeTask, setRouteTask] = useState<PickupTask | null>(null);

  const alerts = useMemo(() => seedPickupAlerts(), []);

  const refresh = useCallback(() => {
    if (!userId) return;
    setTasks(getPickupTasks(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
    showToast(t("pickupTasks.feedback.tasksRefreshed"));
  }, [refresh, showToast, t]);

  const summary = useMemo(() => computePickupTaskSummary(tasks), [tasks]);
  const readiness = useMemo(() => computePickupReadinessSummary(tasks), [tasks]);
  const regions = useMemo(() => getPickupTaskRegions(tasks), [tasks]);
  const upcoming = useMemo(() => getUpcomingPickups(tasks), [tasks]);

  const filteredTasks = useMemo(
    () => filterPickupTasks(tasks, { search, status, region, timeFilter, priority }),
    [tasks, search, status, region, timeFilter, priority],
  );

  const handleAction = (task: PickupTask, action: PickupTaskAction) => {
    if (!userId) return;

    if (action === "view_details") {
      setDetailTask(task);
      return;
    }

    if (action === "open_route") {
      setRouteTask(task);
      showToast(t("pickupTasks.feedback.routeOpened"));
      return;
    }

    if (action === "contact_farmer") {
      showToast(t("pickupTasks.feedback.contactFarmer"));
      return;
    }

    const next = applyPickupTaskAction(userId, task.id, action);
    setTasks(next);
    const updated = next.find((item) => item.id === task.id);

    if (!updated) {
      showToast(t("pickupTasks.feedback.couldNotUpdateTask"));
      return;
    }

    if (action === "start_pickup") {
      showToast(t("pickupTasks.feedback.pickupStartedSuccessfully"));
    } else if (action === "assign_driver") {
      showToast(t("pickupTasks.feedback.driverAssignedSuccessfully"));
    } else {
      showToast(
        t("pickupTasks.feedback.statusUpdatedWithTask", {
          taskId: task.taskId,
          action: translatePickupAction(t, action),
          status: translatePickupStatus(t, updated.status),
        }),
      );
    }

    if (detailTask?.id === task.id && updated) {
      setDetailTask(updated);
    }
  };

  const handleAssignDriver = () => {
    const candidate = tasks.find(
      (task) => task.status === "scheduled" && !task.driverName,
    );
    if (!candidate || !userId) {
      showToast(t("pickupTasks.feedback.noScheduledForDriver"));
      return;
    }
    handleAction(candidate, "assign_driver");
  };

  if (!userId) return null;

  return (
    <div className="agrivo-pickup-tasks space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      <div className="agrivo-pickup-header">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("pickupTasks.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("pickupTasks.subtitle")}
          </p>
        </div>

        <div className="agrivo-pickup-header__aside">
          <div className="agrivo-pickup-helper-card">
            <Info className="h-4 w-4 shrink-0 text-[#15803d]" />
            <p className="text-sm font-medium text-[#14532D]">
              {t("pickupTasks.helper")}
            </p>
          </div>

          <div className="agrivo-pickup-header__actions">
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("pickupTasks.actions.refreshTasks")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={handleAssignDriver}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t("pickupTasks.actions.assignDriver")}
            </Button>
            <Button
              className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate(getLogisticsSectionHash("overview"))}
            >
              <Route className="mr-2 h-4 w-4" />
              {t("pickupTasks.actions.viewRoutePlan")}
            </Button>
          </div>
        </div>
      </div>

      <PickupStats summary={summary} />

      <div className="agrivo-pickup-main-grid">
        <div className="agrivo-pickup-main-left">
          <PickupFilterBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            region={region}
            onRegionChange={setRegion}
            regions={regions}
            priority={priority}
            onPriorityChange={setPriority}
          />

          {filteredTasks.length > 0 ? (
            <div className="agrivo-pickup-list">
              {filteredTasks.map((task) => (
                <PickupTaskCard key={task.id} task={task} onAction={handleAction} />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="agrivo-dashboard-panel agrivo-pickup-empty-filter">
              <p className="text-sm text-[#5F6F64]">{t("pickupTasks.empty.noMatch")}</p>
            </div>
          ) : (
            <div className="agrivo-dashboard-panel">
              <div className="agrivo-dashboard-empty agrivo-pickup-empty">
                <MapPin className="h-10 w-10 text-[#86efac]" strokeWidth={1.5} />
                <h3 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">
                  {t("pickupTasks.empty.noneTitle")}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                  {t("pickupTasks.empty.noneDescription")}
                </p>
                <Button
                  className="mt-5 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => navigate(getLogisticsSectionHash("overview"))}
                >
                  {t("pickupTasks.actions.backToOverview")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="agrivo-pickup-main-right">
          <UpcomingPickupSchedule tasks={upcoming} />
          <UrgentPickupAlerts alerts={alerts} />
          <PickupReadinessCard summary={readiness} />
          <PickupRoutePreview />
        </aside>
      </div>

      <PickupDetailsModal
        task={detailTask}
        open={Boolean(detailTask)}
        onOpenChange={(open) => !open && setDetailTask(null)}
      />

      <PickupRouteModal
        task={routeTask}
        open={Boolean(routeTask)}
        onOpenChange={(open) => !open && setRouteTask(null)}
      />
    </div>
  );
}
