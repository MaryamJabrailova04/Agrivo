import { CheckCircle2, Route, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { isApiMode } from "../../../config/dataMode";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatLogisticsRouteLabel,
  translateLogisticsProduct,
  translateLogisticsRegion,
  translateLogisticsStatus,
} from "../../../i18n/logisticsDashboardHelpers";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  getLogisticsOverview,
  getDeliveries,
  updateDeliveryStatus as updateDeliveryStatusApi,
  type ApiDelivery,
} from "../../../api/logisticsApi";
import {
  computeLogisticsSummary,
  filterDeliveryTasks,
  getDeliveryRegions,
  getDeliveryTasks,
  getLogisticsSectionHash,
  NEXT_STATUS,
  resolveLogisticsUserId,
  seedLogisticsPerformance,
  seedTodayRoute,
  seedUrgentAlerts,
  updateDeliveryTaskStatus,
  type DeliveryDateFilter,
  type DeliveryPriorityFilter,
  type DeliveryStatusFilter,
  type DeliveryTask,
  type DeliveryTaskStatus,
} from "../../utils/logisticsDashboardStorage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DeliveryTaskItem } from "./logistics-overview/DeliveryTaskItem";
import { DeliveryTasksFilterBar } from "./logistics-overview/DeliveryTasksFilterBar";
import {
  DeliveryTasksCard,
  DeliveryTasksEmptyState,
  LogisticsOverviewLeftColumn,
  LogisticsOverviewMainGrid,
  LogisticsOverviewRightColumn,
} from "./logistics-overview/LogisticsOverviewLayout";
import { OverviewStats } from "./logistics-overview/OverviewStats";
import { PerformanceSummaryCard } from "./logistics-overview/PerformanceSummaryCard";
import { QuickActionsCard } from "./logistics-overview/QuickActionsCard";
import { RouteSummaryCard } from "./logistics-overview/RouteSummaryCard";
import { UrgentAlertsCard } from "./logistics-overview/UrgentAlertsCard";

function navigate(hash: string) {
  navigateToHash(hash);
}

export function LogisticsOverviewPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const userId = resolveLogisticsUserId(user);

  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DeliveryStatusFilter>("all");
  const [region, setRegion] = useState("all");
  const [dateFilter, setDateFilter] = useState<DeliveryDateFilter>("today");
  const [priority, setPriority] = useState<DeliveryPriorityFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<DeliveryTask | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiOverview, setApiOverview] = useState<{
    assignedToday: number;
    pickupPending: number;
    inTransit: number;
    completedToday: number;
    delayed: number;
    totalStops: number;
  } | null>(null);

  const route = useMemo(() => seedTodayRoute(), []);
  const alerts = useMemo(() => seedUrgentAlerts(), []);
  const performance = useMemo(() => seedLogisticsPerformance(), []);

  const refresh = useCallback(() => {
    if (!userId) return;
    if (isApiMode) {
      Promise.all([getDeliveries(), getLogisticsOverview()])
        .then(([deliveries, overview]) => {
          setTasks(deliveries.map(mapApiDeliveryToTask));
          setApiOverview({
            assignedToday: overview.assigned,
            pickupPending: overview.pickupScheduled,
            inTransit: overview.inTransit,
            completedToday: overview.delivered,
            delayed: overview.delayed,
            totalStops: overview.total,
          });
        })
        .catch(() => setApiError(t("logisticsDashboard.feedback.failedLoad")));
      return;
    }
    setTasks(getDeliveryTasks(userId));
  }, [userId, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const summary = useMemo(
    () => (isApiMode && apiOverview ? apiOverview : computeLogisticsSummary(tasks)),
    [tasks, apiOverview],
  );
  const regions = useMemo(() => getDeliveryRegions(tasks), [tasks]);

  const filteredTasks = useMemo(
    () => filterDeliveryTasks(tasks, { search, status, region, dateFilter, priority }),
    [tasks, search, status, region, dateFilter, priority],
  );

  const activeTasks = useMemo(
    () => filteredTasks.filter((task) => task.status !== "delivered"),
    [filteredTasks],
  );

  const handleStatusAdvance = (task: DeliveryTask) => {
    if (!userId) return;
    if (isApiMode) {
      const next = NEXT_STATUS[task.status];
      if (!next) return;
      updateDeliveryStatusApi(task.id, next)
        .then(() => refresh())
        .catch(() => setApiError(t("logisticsDashboard.feedback.failedUpdate")));
      return;
    }
    const next = NEXT_STATUS[task.status];
    if (!next) {
      showToast(
        t("logisticsDashboard.feedback.alreadyStatus", {
          taskId: task.taskId,
          status: translateLogisticsStatus(t, task.status),
        }),
      );
      return;
    }
    const updated = updateDeliveryTaskStatus(userId, task.id, next);
    setTasks(updated);
    showToast(
      t("logisticsDashboard.feedback.statusUpdated", {
        taskId: task.taskId,
        status: translateLogisticsStatus(t, next),
      }),
    );
    if (detailTask?.id === task.id) {
      setDetailTask({ ...task, status: next });
    }
  };

  const handleQuickStatus = (targetStatus: DeliveryTaskStatus) => {
    const candidate = tasks.find((task) => task.status !== "delivered");
    if (!candidate || !userId) {
      showToast(t("logisticsDashboard.feedback.noActiveTask"));
      return;
    }
    const updated = updateDeliveryTaskStatus(userId, candidate.id, targetStatus);
    setTasks(updated);
    showToast(
      t("logisticsDashboard.feedback.markedAs", {
        taskId: candidate.taskId,
        status: translateLogisticsStatus(t, targetStatus),
      }),
    );
  };

  if (!userId) return null;

  const hasTasks = tasks.length > 0;

  return (
    <div className="agrivo-logistics-overview">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}
      {apiError ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {apiError}
        </div>
      ) : null}

      <div className="agrivo-logistics-overview-header">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("logisticsDashboard.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("logisticsDashboard.subtitle")}
          </p>
        </div>
        <div className="agrivo-logistics-overview-header-actions">
          <Button
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={() => navigate(getLogisticsSectionHash("pickup"))}
          >
            <Truck className="mr-2 h-4 w-4" />
            {t("logisticsDashboard.actions.assignPickup")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => navigate(getLogisticsSectionHash("assigned"))}
          >
            {t("logisticsDashboard.actions.viewDeliveries")}
          </Button>
          <Button
            variant="outline"
            className="hidden rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC] sm:inline-flex"
            onClick={() => showToast(t("logisticsDashboard.feedback.routeOptimization"))}
          >
            <Route className="mr-2 h-4 w-4" />
            {t("logisticsDashboard.actions.optimizeRoute")}
          </Button>
        </div>
      </div>

      <OverviewStats summary={summary} />

      <LogisticsOverviewMainGrid>
        <LogisticsOverviewLeftColumn>
          <RouteSummaryCard route={route} />

          {hasTasks ? (
            <DeliveryTasksCard taskCount={activeTasks.length}>
              <DeliveryTasksFilterBar
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                region={region}
                onRegionChange={setRegion}
                regions={regions}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                priority={priority}
                onPriorityChange={setPriority}
              />

              {activeTasks.length > 0 ? (
                <div className="agrivo-logistics-tasks-list">
                  {activeTasks.map((task) => (
                    <DeliveryTaskItem
                      key={task.id}
                      task={task}
                      onViewDetails={setDetailTask}
                      onUpdateStatus={handleStatusAdvance}
                      onOpenRoute={() =>
                        showToast(
                          t("logisticsDashboard.feedback.openingRoute", { taskId: task.taskId }),
                        )
                      }
                      onContact={() =>
                        showToast(
                          t("logisticsDashboard.feedback.contactOptions", { taskId: task.taskId }),
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="agrivo-logistics-tasks-empty-filter">
                  <p className="text-sm text-[#5F6F64]">{t("logisticsDashboard.tasks.noMatch")}</p>
                </div>
              )}
            </DeliveryTasksCard>
          ) : (
            <DeliveryTasksEmptyState onAssignPickup={() => navigate(getLogisticsSectionHash("pickup"))} />
          )}
        </LogisticsOverviewLeftColumn>

        <LogisticsOverviewRightColumn>
          <QuickActionsCard
            onAssignPickup={() => navigate(getLogisticsSectionHash("pickup"))}
            onMarkPickedUp={() => handleQuickStatus("picked_up")}
            onMarkInTransit={() => handleQuickStatus("in_transit")}
            onMarkDelivered={() => handleQuickStatus("delivered")}
            onContactFarmer={() => showToast(t("logisticsDashboard.feedback.contactFarmer"))}
            onContactBuyer={() => showToast(t("logisticsDashboard.feedback.contactBuyer"))}
          />
          <UrgentAlertsCard alerts={alerts} />
          <PerformanceSummaryCard performance={performance} />
        </LogisticsOverviewRightColumn>
      </LogisticsOverviewMainGrid>

      <Dialog open={Boolean(detailTask)} onOpenChange={(open) => !open && setDetailTask(null)}>
        <DialogContent className="agrivo-profile-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {detailTask
                ? t("logisticsDashboard.tasks.modalTitle", { taskId: detailTask.taskId })
                : t("logisticsDashboard.tasks.modalFallback")}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F6F64]">
              {detailTask
                ? formatLogisticsRouteLabel(
                    t,
                    detailTask.pickupLocation,
                    detailTask.dropoffLocation,
                  )
                : null}
            </DialogDescription>
          </DialogHeader>
          {detailTask ? (
            <dl className="agrivo-logistics-task-detail-grid">
              <div>
                <dt>{t("logisticsDashboard.tasks.labels.product")}</dt>
                <dd>
                  {translateLogisticsProduct(t, language, detailTask.productName)} ·{" "}
                  {detailTask.quantity} {detailTask.unit}
                </dd>
              </div>
              <div>
                <dt>{t("logisticsDashboard.tasks.labels.pickupTime")}</dt>
                <dd>{detailTask.pickupTime}</dd>
              </div>
              <div>
                <dt>{t("logisticsDashboard.tasks.eta")}</dt>
                <dd>{detailTask.eta}</dd>
              </div>
              <div>
                <dt>{t("logisticsDashboard.tasks.labels.driver")}</dt>
                <dd>{detailTask.driverName}</dd>
              </div>
              <div>
                <dt>{t("logisticsDashboard.tasks.labels.vehicle")}</dt>
                <dd>{detailTask.vehicle}</dd>
              </div>
              <div>
                <dt>{t("logisticsDashboard.tasks.labels.region")}</dt>
                <dd>{translateLogisticsRegion(t, detailTask.region)}</dd>
              </div>
            </dl>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => setDetailTask(null)}
            >
              {t("logisticsDashboard.actions.close")}
            </Button>
            {detailTask && detailTask.status !== "delivered" ? (
              <Button
                className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                onClick={() => {
                  handleStatusAdvance(detailTask);
                }}
              >
                {t("logisticsDashboard.actions.updateStatus")}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function mapApiDeliveryToTask(delivery: ApiDelivery): DeliveryTask {
  return {
    id: delivery.id,
    taskId: delivery.id.slice(-8).toUpperCase(),
    pickupLocation: delivery.pickupLocation ?? "Pickup location",
    dropoffLocation: delivery.dropoffLocation ?? "Dropoff location",
    productName: "Produce",
    quantity: 0,
    unit: "kg",
    pickupTime: delivery.pickupTime ? new Date(delivery.pickupTime).toLocaleTimeString() : "TBD",
    eta: delivery.eta ? new Date(delivery.eta).toLocaleTimeString() : "TBD",
    driverName: delivery.driverName ?? "Driver",
    vehicle: delivery.vehicle ?? "Vehicle",
    status:
      delivery.status === "pickup_started"
        ? "picked_up"
        : delivery.status === "pickup_scheduled"
          ? "pickup_scheduled"
          : delivery.status === "in_transit"
            ? "in_transit"
            : delivery.status === "delivered"
              ? "delivered"
              : delivery.status === "delayed"
                ? "delayed"
                : "assigned",
    priority: delivery.priority === "high" ? "high" : delivery.priority === "low" ? "low" : "normal",
    region: "Azerbaijan",
    dateLabel: "Today",
  };
}
