import { navigateToHash } from "../../../i18n/localizedRoutes";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  translateInTransitAction,
  translateInTransitStatus,
} from "../../../i18n/inTransitHelpers";
import {
  AlertTriangle,
  CheckCircle2,
  Map,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  applyInTransitAction,
  computeInTransitSummary,
  computeRouteProgressSummary,
  filterInTransitDeliveries,
  getInTransitDeliveries,
  getInTransitDrivers,
  getInTransitRegions,
  getLogisticsSectionHash,
  resolveInTransitUserId,
  seedTransitDrivers,
  seedTransitEtaAlerts,
  seedTransitIssues,
  type EtaStatusFilter,
  type InTransitAction,
  type InTransitDelivery,
  type InTransitStatusFilter,
} from "../../utils/inTransitStorage";
import { Button } from "../ui/button";
import { ActiveDriversCard } from "./logistics-in-transit/ActiveDriversCard";
import { EtaAlertsCard } from "./logistics-in-transit/EtaAlertsCard";
import { InTransitDeliveryCard } from "./logistics-in-transit/InTransitDeliveryCard";
import { InTransitFilterBar } from "./logistics-in-transit/InTransitFilterBar";
import { InTransitStats } from "./logistics-in-transit/InTransitStats";
import { IssueCenterCard } from "./logistics-in-transit/IssueCenterCard";
import { LiveDeliveryMap } from "./logistics-in-transit/LiveDeliveryMap";
import { RouteProgressCard } from "./logistics-in-transit/RouteProgressCard";
import { TransitDetailsModal } from "./logistics-in-transit/TransitDetailsModal";
import { TransitRouteModal } from "./logistics-in-transit/TransitRouteModal";

function navigate(hash: string) {
  navigateToHash(hash);
}

export function InTransitPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolveInTransitUserId(user);

  const [deliveries, setDeliveries] = useState<InTransitDelivery[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InTransitStatusFilter>("all");
  const [region, setRegion] = useState("all");
  const [etaFilter, setEtaFilter] = useState<EtaStatusFilter>("all");
  const [driver, setDriver] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [detailDelivery, setDetailDelivery] = useState<InTransitDelivery | null>(null);
  const [routeDelivery, setRouteDelivery] = useState<InTransitDelivery | null>(null);
  const [showLiveMap, setShowLiveMap] = useState(false);

  const drivers = useMemo(() => seedTransitDrivers(), []);
  const etaAlerts = useMemo(() => seedTransitEtaAlerts(), []);
  const issues = useMemo(() => seedTransitIssues(), []);

  const refresh = useCallback(() => {
    if (!userId) return;
    setDeliveries(getInTransitDeliveries(userId));
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
    showToast(t("inTransitPage.feedback.locationsRefreshed"));
  }, [refresh, showToast, t]);

  const activeDeliveries = useMemo(
    () => deliveries.filter((d) => d.status !== "delivered"),
    [deliveries],
  );

  const summary = useMemo(() => computeInTransitSummary(deliveries), [deliveries]);
  const routeProgress = useMemo(() => computeRouteProgressSummary(deliveries), [deliveries]);
  const regions = useMemo(() => getInTransitRegions(deliveries), [deliveries]);
  const driverNames = useMemo(() => getInTransitDrivers(deliveries), [deliveries]);

  const filteredDeliveries = useMemo(
    () =>
      filterInTransitDeliveries(activeDeliveries, {
        search,
        status,
        region,
        etaFilter,
        driver,
      }),
    [activeDeliveries, search, status, region, etaFilter, driver],
  );

  const handleAction = (delivery: InTransitDelivery, action: InTransitAction) => {
    if (!userId) return;

    if (action === "view_details") {
      setDetailDelivery(delivery);
      return;
    }

    if (action === "open_route") {
      setRouteDelivery(delivery);
      showToast(t("inTransitPage.feedback.routeOpened"));
      return;
    }

    if (action === "contact_driver") {
      showToast(t("inTransitPage.feedback.driverContacted"));
      return;
    }

    if (action === "notify_buyer") {
      showToast(t("inTransitPage.feedback.buyerNotified"));
      return;
    }

    const next = applyInTransitAction(userId, delivery.id, action);
    setDeliveries(next);
    const updated = next.find((d) => d.id === delivery.id);

    if (!updated) {
      showToast(t("inTransitPage.feedback.couldNotUpdateShipment"));
      return;
    }
    if (action === "mark_delivered") {
      showToast(t("inTransitPage.feedback.markedAsDelivered"));
    } else if (action === "confirm_arrival") {
      showToast(t("inTransitPage.feedback.arrivalConfirmed"));
    } else if (action === "report_issue") {
      showToast(t("inTransitPage.feedback.issueReported"));
    } else {
      showToast(
        t("inTransitPage.feedback.statusUpdatedWithTask", {
          taskId: delivery.taskId,
          action: translateInTransitAction(t, action),
          status: translateInTransitStatus(t, updated.status),
        }),
      );
    }

    if (detailDelivery?.id === delivery.id && updated) {
      setDetailDelivery(updated);
    }
  };

  const handleViewIssue = (taskId: string) => {
    const match = deliveries.find((d) => d.taskId === taskId);
    if (match) setDetailDelivery(match);
    else showToast(t("inTransitPage.feedback.issueOpened"));
  };

  const handleReportIssue = () => {
    const candidate = activeDeliveries.find((d) => !d.issue);
    if (!candidate || !userId) {
      showToast(t("inTransitPage.feedback.noIssueCandidate"));
      return;
    }
    handleAction(candidate, "report_issue");
  };

  if (!userId) return null;

  return (
    <div className="agrivo-in-transit space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      <div className="agrivo-transit-header">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("inTransitPage.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("inTransitPage.subtitle")}
          </p>
        </div>
        <div className="agrivo-transit-header__actions">
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("inTransitPage.actions.refreshLocations")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => setShowLiveMap(true)}
          >
            <Map className="mr-2 h-4 w-4" />
            {t("inTransitPage.actions.viewLiveMap")}
          </Button>
          <Button
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={handleReportIssue}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t("inTransitPage.actions.reportIssue")}
          </Button>
        </div>
      </div>

      <InTransitStats summary={summary} />

      <div className="agrivo-transit-main-grid">
        <div className="agrivo-transit-main-left">
          <LiveDeliveryMap />

          <InTransitFilterBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            region={region}
            onRegionChange={setRegion}
            regions={regions}
            etaFilter={etaFilter}
            onEtaFilterChange={setEtaFilter}
            driver={driver}
            onDriverChange={setDriver}
            drivers={driverNames}
          />

          {filteredDeliveries.length > 0 ? (
            <div className="agrivo-transit-list">
              {filteredDeliveries.map((delivery) => (
                <InTransitDeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onAction={handleAction}
                />
              ))}
            </div>
          ) : activeDeliveries.length > 0 ? (
            <div className="agrivo-dashboard-panel agrivo-transit-empty-filter">
              <p className="text-sm text-[#5F6F64]">{t("inTransitPage.empty.noMatch")}</p>
            </div>
          ) : (
            <div className="agrivo-dashboard-panel">
              <div className="agrivo-dashboard-empty agrivo-transit-empty">
                <Truck className="h-10 w-10 text-[#86efac]" strokeWidth={1.5} />
                <h3 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">
                  {t("inTransitPage.empty.noneTitle")}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                  {t("inTransitPage.empty.noneDescription")}
                </p>
                <Button
                  className="mt-5 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => navigate(getLogisticsSectionHash("pickup"))}
                >
                  {t("inTransitPage.actions.viewPickupTasks")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="agrivo-transit-main-right">
          <ActiveDriversCard drivers={drivers} />
          <EtaAlertsCard alerts={etaAlerts} />
          <RouteProgressCard summary={routeProgress} />
          <IssueCenterCard issues={issues} onViewIssue={handleViewIssue} />
        </aside>
      </div>

      <TransitDetailsModal
        delivery={detailDelivery}
        open={Boolean(detailDelivery)}
        onOpenChange={(open) => !open && setDetailDelivery(null)}
      />

      <TransitRouteModal
        delivery={routeDelivery ?? (showLiveMap ? activeDeliveries[0] ?? null : null)}
        open={Boolean(routeDelivery) || showLiveMap}
        onOpenChange={(open) => {
          if (!open) {
            setRouteDelivery(null);
            setShowLiveMap(false);
          }
        }}
      />
    </div>
  );
}
