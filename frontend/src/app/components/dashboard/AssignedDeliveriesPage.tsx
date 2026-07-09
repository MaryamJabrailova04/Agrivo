import { CheckCircle2, ClipboardList, Info, RefreshCw, Route } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateAssignedStatus } from "../../../i18n/assignedDeliveriesHelpers";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  applyAssignedDeliveryAction,
  computeAssignedDeliverySummary,
  filterAssignedDeliveries,
  getAssignedDeliveries,
  getAssignedDeliveryRegions,
  getLogisticsSectionHash,
  resolveAssignedDeliveriesUserId,
  type AssignedDateFilter,
  type AssignedDelivery,
  type AssignedDeliveryAction,
  type AssignedPriorityFilter,
  type AssignedStatusFilter,
} from "../../utils/assignedDeliveriesStorage";
import { Button } from "../ui/button";
import { AssignedDeliveryCard } from "./logistics-assigned/AssignedDeliveryCard";
import { AssignedDeliveryStats } from "./logistics-assigned/AssignedDeliveryStats";
import { DeliveryDetailsModal } from "./logistics-assigned/DeliveryDetailsModal";
import { DeliveryFilterBar } from "./logistics-assigned/DeliveryFilterBar";
import { DeliveryRouteModal } from "./logistics-assigned/DeliveryRouteModal";

function navigate(hash: string) {
  navigateToHash(hash);
}

export function AssignedDeliveriesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolveAssignedDeliveriesUserId(user);

  const [deliveries, setDeliveries] = useState<AssignedDelivery[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssignedStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<AssignedDateFilter>("today");
  const [region, setRegion] = useState("all");
  const [priority, setPriority] = useState<AssignedPriorityFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [detailDelivery, setDetailDelivery] = useState<AssignedDelivery | null>(null);
  const [routeDelivery, setRouteDelivery] = useState<AssignedDelivery | null>(null);

  const refresh = useCallback(() => {
    if (!userId) return;
    setDeliveries(getAssignedDeliveries(userId));
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
    showToast(t("assignedDeliveries.feedback.tasksRefreshed"));
  }, [refresh, showToast, t]);

  const summary = useMemo(() => computeAssignedDeliverySummary(deliveries), [deliveries]);
  const regions = useMemo(() => getAssignedDeliveryRegions(deliveries), [deliveries]);

  const filteredDeliveries = useMemo(
    () => filterAssignedDeliveries(deliveries, { search, status, region, dateFilter, priority }),
    [deliveries, search, status, region, dateFilter, priority],
  );

  const handleAction = (delivery: AssignedDelivery, action: AssignedDeliveryAction) => {
    if (!userId) return;

    if (action === "view_details") {
      setDetailDelivery(delivery);
      return;
    }

    if (action === "open_route") {
      setRouteDelivery(delivery);
      showToast(t("assignedDeliveries.feedback.routeOpened"));
      return;
    }

    if (action === "contact") {
      showToast(t("assignedDeliveries.feedback.contactOptions"));
      return;
    }

    const next = applyAssignedDeliveryAction(userId, delivery.id, action);
    setDeliveries(next);
    const updated = next.find((item) => item.id === delivery.id);
    const nextStatus = updated?.status;

    if (!updated) {
      showToast(t("assignedDeliveries.feedback.couldNotUpdateStatus"));
      return;
    }

    if (action === "start_pickup") {
      showToast(t("assignedDeliveries.feedback.pickupStarted"));
    } else {
      showToast(
        t("assignedDeliveries.feedback.statusUpdatedWithTask", {
          taskId: delivery.taskId,
          status: translateAssignedStatus(t, nextStatus ?? updated.status),
        }),
      );
    }

    if (detailDelivery?.id === delivery.id && updated) {
      setDetailDelivery(updated);
    }
  };

  if (!userId) return null;

  return (
    <div className="agrivo-assigned-deliveries space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      <div className="agrivo-assigned-header">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("assignedDeliveries.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("assignedDeliveries.subtitle")}
          </p>
        </div>

        <div className="agrivo-assigned-header__aside">
          <div className="agrivo-assigned-helper-card">
            <Info className="h-4 w-4 shrink-0 text-[#15803d]" />
            <p className="text-sm font-medium text-[#14532D]">
              {t("assignedDeliveries.helper")}
            </p>
          </div>

          <div className="agrivo-assigned-header__actions">
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("assignedDeliveries.actions.refreshTasks")}
            </Button>
            <Button
              className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate(getLogisticsSectionHash("overview"))}
            >
              <Route className="mr-2 h-4 w-4" />
              {t("assignedDeliveries.actions.viewRoutePlan")}
            </Button>
          </div>
        </div>
      </div>

      <AssignedDeliveryStats summary={summary} />

      <DeliveryFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        region={region}
        onRegionChange={setRegion}
        regions={regions}
        priority={priority}
        onPriorityChange={setPriority}
      />

      {filteredDeliveries.length > 0 ? (
        <div className="agrivo-assigned-list">
          {filteredDeliveries.map((delivery) => (
            <AssignedDeliveryCard key={delivery.id} delivery={delivery} onAction={handleAction} />
          ))}
        </div>
      ) : deliveries.length > 0 ? (
        <div className="agrivo-dashboard-panel agrivo-assigned-empty-filter">
          <p className="text-sm text-[#5F6F64]">{t("assignedDeliveries.empty.noMatch")}</p>
        </div>
      ) : (
        <div className="agrivo-dashboard-panel">
          <div className="agrivo-dashboard-empty agrivo-assigned-empty">
            <ClipboardList className="h-10 w-10 text-[#86efac]" strokeWidth={1.5} />
            <h3 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">
              {t("assignedDeliveries.empty.noneTitle")}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
              {t("assignedDeliveries.empty.noneDescription")}
            </p>
            <Button
              className="mt-5 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate(getLogisticsSectionHash("overview"))}
            >
              {t("assignedDeliveries.actions.goToOverview")}
            </Button>
          </div>
        </div>
      )}

      <DeliveryDetailsModal
        delivery={detailDelivery}
        open={Boolean(detailDelivery)}
        onOpenChange={(open) => !open && setDetailDelivery(null)}
      />

      <DeliveryRouteModal
        delivery={routeDelivery}
        open={Boolean(routeDelivery)}
        onOpenChange={(open) => !open && setRouteDelivery(null)}
      />
    </div>
  );
}
