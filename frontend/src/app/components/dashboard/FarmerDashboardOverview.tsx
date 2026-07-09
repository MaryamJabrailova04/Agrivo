import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  MapPin,
  MessageCircle,
  PackagePlus,
  Pencil,
  RefreshCw,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  farmerActiveJobs,
  farmerProductPerformance,
  farmerRecentOrders,
  farmerStockAlerts,
  farmerSummaryStats,
  farmerTodaysTasks,
  FARMER_DASHBOARD_JOBS_NEW_HASH,
  getFarmerJobEditHash,
  getFarmerPublicProfileHash,
  getFarmerSectionHash,
  type FarmerOrderStatus,
  type ProductListingStatus,
  type StockAlertType,
  type TaskPriority,
} from "../../data/farmerDashboard";
import { FARMER_DASHBOARD_JOBS_HASH } from "./dashboardConfig";
import { FarmerOrderStatusBadge } from "./FarmerOrderStatusBadge";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { useLanguage, type TranslateFn } from "../../../i18n/LanguageContext";

function navigate(hash: string) {
  navigateToHash(hash);
}

function TaskPriorityBadge({ priority, t }: { priority?: TaskPriority; t: TranslateFn }) {
  if (!priority) return null;

  const tone =
    priority === "high"
      ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
      : priority === "medium"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : "bg-[#f0f7ee] text-[#14532D] border-[#dbe7d4]";

  const label =
    priority === "high"
      ? t("priority.high")
      : priority === "medium"
        ? t("priority.medium")
        : t("priority.low");

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", tone)}>
      {label}
    </span>
  );
}

function ProductStatusBadge({ status, t }: { status: ProductListingStatus; t: TranslateFn }) {
  const tone =
    status === "Low stock"
      ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
      : status === "Fresh listing"
        ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
        : "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]";

  const label =
    status === "Active"
      ? t("status.active")
      : status === "Low stock"
        ? t("status.lowStock")
        : t("status.freshListing");

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", tone)}>
      {label}
    </span>
  );
}

function StockAlertBadge({ type, t }: { type: StockAlertType; t: TranslateFn }) {
  const tone =
    type === "Low stock"
      ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
      : type === "Needs update"
        ? "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]"
        : type === "Expiring soon"
          ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
          : "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]";

  const label =
    type === "Low stock"
      ? t("status.lowStock")
      : type === "Needs update"
        ? t("status.needsUpdate")
        : type === "Active"
          ? t("status.active")
          : t("status.expiringSoon");

  return (
    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", tone)}>
      {label}
    </span>
  );
}

const NEXT_STATUS: Partial<Record<FarmerOrderStatus, FarmerOrderStatus>> = {
  New: "Confirmed",
  Confirmed: "Pickup scheduled",
  "Pickup scheduled": "In transit",
  "In transit": "Delivered",
};

export function FarmerDashboardOverview() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const displayName = user?.name ?? "Demo Farmer";
  const publicProfileHash = getFarmerPublicProfileHash(user);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleStatClick = (stat: (typeof farmerSummaryStats)[number]) => {
    if (stat.externalHash) {
      navigate(stat.externalHash);
      return;
    }
    if (stat.sectionId) {
      navigate(getFarmerSectionHash(stat.sectionId));
    }
  };

  const translateOrderStatus = (status: FarmerOrderStatus) => {
    if (status === "New") return t("status.new");
    if (status === "Confirmed") return t("status.confirmed");
    if (status === "Pickup scheduled") return t("status.pickupScheduled");
    if (status === "In transit") return t("status.inTransit");
    if (status === "Delivered") return t("status.delivered");
    if (status === "Cancelled") return t("status.cancelled");
    return status;
  };

  const translateProductName = (product: string) => {
    const keyByName: Record<string, string> = {
      Apples: "products.apple",
      Cherries: "products.cherry",
      Tomatoes: "products.tomato",
      Cucumbers: "products.cucumber",
      Potatoes: "products.potato",
    };
    const key = keyByName[product];
    return key ? t(key) : product;
  };

  const translateBuyerName = (buyer: string) => {
    const map: Record<string, string> = {
      "Green Market Baku": "farmerDashboard.mock.buyers.greenMarketBaku",
      "Local Produce Hub": "farmerDashboard.mock.buyers.localProduceHub",
      "Fresh Bazaar Sumqayıt": "farmerDashboard.mock.buyers.freshBazaarSumqayit",
      "Fresh Bazaar Sumgayit": "farmerDashboard.mock.buyers.freshBazaarSumqayit",
    };
    const key = map[buyer];
    return key ? t(key) : buyer;
  };

  const translateRoute = (route: string) => {
    const map: Record<string, string> = {
      "Quba → Baku": "farmerDashboard.routes.qubaBaku",
      "Lənkaran → Bakı": "farmerDashboard.routes.lankaranBaku",
      "Şəki → Sumqayıt": "farmerDashboard.routes.shekiSumqayit",
    };
    const key = map[route];
    return key ? t(key) : route;
  };

  const translateKgAmount = (quantity: string) => {
    const kgUnit = t("common.kg");
    const match = quantity.match(/([\d.,]+)\s*kg/i);
    if (!match) return quantity;
    const amount = match[1].replace(/,/g, "");
    return `${amount} ${kgUnit}`;
  };

  const translateTaskText = (text: string) => {
    const map: Record<string, string> = {
      "Confirm 2 new buyer orders": "farmerDashboard.dailyOperations.confirmOrders",
      "Prepare 45 kg cherries for pickup": "farmerDashboard.dailyOperations.prepareCherries",
      "Update stock for tomatoes": "farmerDashboard.dailyOperations.updateTomatoStock",
      "Review 1 farm job application": "farmerDashboard.dailyOperations.reviewJobApplication",
    };
    const key = map[text];
    return key ? t(key) : text;
  };

  const translateJobTitle = (title: string) => {
    const map: Record<string, string> = {
      "Cherry Harvest Workers Needed": "farmerDashboard.jobPosts.cherryHarvestWorkersNeeded",
      "Apple Picking Season Helpers": "farmerDashboard.jobPosts.applePickingSeasonHelpers",
    };
    const key = map[title];
    return key ? t(key) : title;
  };

  const translateJobLocation = (location: string) => {
    const map: Record<string, string> = {
      "Quba, Alpan village": "farmerDashboard.mock.locations.qubaAlpanVillage",
    };
    const key = map[location];
    return key ? t(key) : location;
  };

  const translateSoldLabel = (soldLabel: string) => {
    const countMatch = soldLabel.match(/([\d.,]+)\s*kg/i);
    const countRaw = countMatch?.[1];
    const count = countRaw ? Number.parseFloat(countRaw.replace(/,/g, "")) : null;
    if (count === null) return soldLabel;
    if (soldLabel.toLowerCase().includes("sold")) return t("farmerDashboard.salesInsights.kgSold", { count });
    if (soldLabel.toLowerCase().includes("listed"))
      return t("farmerDashboard.salesInsights.kgListed", { count });
    if (soldLabel.toLowerCase().includes("available"))
      return t("farmerDashboard.salesInsights.kgAvailable", { count });
    return soldLabel;
  };

  const translatePrice = (price?: string) => {
    if (!price) return price;
    const kgUnit = t("common.kg");
    return price.replace(/\/kg\b/gi, `/${kgUnit}`);
  };

  const translateStockMessage = (message: string) => {
    const onlyLeftMatch = message.match(/Only\s+([\d.,]+)\s*kg\s+left/i);
    if (onlyLeftMatch) {
      const count = Number.parseFloat(onlyLeftMatch[1].replace(/,/g, ""));
      return t("farmerDashboard.stockAlerts.onlyKgLeft", { count });
    }
    const availableMatch = message.match(/([\d.,]+)\s*kg\s+available/i);
    if (availableMatch) {
      const count = Number.parseFloat(availableMatch[1].replace(/,/g, ""));
      return t("farmerDashboard.stockAlerts.kgAvailable", { count });
    }
    if (message === "Harvest date needs update") return t("farmerDashboard.stockAlerts.harvestDateNeedsUpdate");
    if (message === "Listing expires soon") return t("farmerDashboard.stockAlerts.listingExpiresSoon");
    return message;
  };

  const formatOrderDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(language === "az" ? "az-AZ" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleUpdateStatus = (orderId: string, currentStatus: FarmerOrderStatus) => {
    const next = NEXT_STATUS[currentStatus];
    if (next) {
      showToast(
        t("farmerDashboard.toasts.orderStatusUpdated", {
          orderId,
          nextStatus: translateOrderStatus(next),
        }),
      );
    } else {
      showToast(
        t("farmerDashboard.toasts.orderStatusAlready", {
          orderId,
          currentStatus: translateOrderStatus(currentStatus),
        }),
      );
    }
  };

  return (
    <div className="agrivo-farmer-overview space-y-6">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckSquare className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}

      {/* Welcome + quick actions */}
      <section className="agrivo-dashboard-panel agrivo-farmer-welcome">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
              {t("farmerDashboard.overview.title")}
            </p>
            <h2 className="agrivo-heading mt-1 text-2xl font-bold text-[#102018] sm:text-3xl">
              {t("farmerDashboard.overview.welcome", { name: displayName })}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#5F6F64] sm:text-base">
              {t("farmerDashboard.overview.subtitle")}
            </p>
          </div>
          <div className="agrivo-farmer-quick-actions">
            <Button
              className="agrivo-button-soft rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate(getFarmerSectionHash("add-product"))}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {t("farmerDashboard.actions.addProduct")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(FARMER_DASHBOARD_JOBS_NEW_HASH)}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {t("farmerDashboard.actions.createJobPost")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(getFarmerSectionHash("orders"))}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {t("farmerDashboard.actions.viewOrders")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(publicProfileHash)}
            >
              <UserRound className="mr-2 h-4 w-4" />
              {t("farmerDashboard.actions.viewPublicProfile")}
            </Button>
          </div>
        </div>
      </section>

      {/* Summary stats */}
      <section className="agrivo-farmer-stats">
        {farmerSummaryStats.map((stat) => {
          const Icon = stat.icon;
          const label =
            stat.label === "Active Products"
              ? t("farmerDashboard.stats.activeProducts")
              : stat.label === "Open Orders"
                ? t("farmerDashboard.stats.openOrders")
                : stat.label === "Active Job Posts"
                  ? t("farmerDashboard.stats.activeJobPosts")
                  : stat.label === "Completed Sales"
                    ? t("farmerDashboard.stats.completedSales")
                    : stat.label === "Revenue This Season"
                      ? t("farmerDashboard.stats.revenueThisSeason")
                      : stat.label === "Low Stock Items"
                        ? t("farmerDashboard.stats.lowStockItems")
                        : stat.label;
          const hint =
            stat.hint === "Listed in marketplace"
              ? t("farmerDashboard.stats.listedInMarketplace")
              : stat.hint === "From buyers"
                ? t("farmerDashboard.stats.fromBuyers")
                : stat.hint === "Seasonal roles"
                  ? t("farmerDashboard.stats.seasonalRoles")
                  : stat.hint === "This season"
                    ? t("farmerDashboard.stats.thisSeason")
                    : stat.hint === "Gross marketplace sales"
                      ? t("farmerDashboard.stats.grossMarketplaceSales")
                      : stat.hint === "Needs attention"
                        ? t("farmerDashboard.stats.needsAttention")
                        : stat.hint;
          return (
            <button
              key={stat.id}
              type="button"
              className="agrivo-farmer-stat-card agrivo-card text-left"
              onClick={() => handleStatClick(stat)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5]">
                  <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={1.75} />
                </div>
                <span className="agrivo-heading text-2xl font-bold text-[#102018]">{stat.value}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#102018]">{label}</p>
              <p className="mt-0.5 text-xs text-[#6b7a70]">{hint}</p>
            </button>
          );
        })}
      </section>

      {/* Main grid */}
      <div className="agrivo-farmer-main-grid">
        <div className="agrivo-farmer-main-left space-y-6">
          {/* Recent buyer orders */}
          <section className="agrivo-dashboard-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                  {t("farmerDashboard.buyerActivity.title")}
                </p>
                <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018]">{t("farmerDashboard.buyerActivity.recentBuyerOrders")}</h3>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[#14532D] hover:text-[#1D6A3B]"
                onClick={() => navigate(getFarmerSectionHash("orders"))}
              >
                {t("farmerDashboard.actions.viewAll")}
              </button>
            </div>

            {farmerRecentOrders.length > 0 ? (
              <div className="space-y-3">
                {farmerRecentOrders.map((order) => (
                  <article key={order.id} className="agrivo-farmer-order-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#102018]">
                          {translateProductName(order.product)} · {translateKgAmount(order.quantity)}
                        </p>
                        <p className="mt-1 text-sm text-[#5F6F64]">
                          {t("farmerDashboard.buyerActivity.buyer")}: {translateBuyerName(order.buyer)}
                        </p>
                      </div>
                      <FarmerOrderStatusBadge status={order.status} />
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-[#5F6F64] sm:grid-cols-2">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                        {translateRoute(order.route)}
                      </p>
                      <p>
                        <span className="font-medium text-[#102018]">
                          {t("farmerDashboard.buyerActivity.total")}:
                        </span>{" "}
                        {order.total}
                      </p>
                      <p className="flex items-center gap-1 sm:col-span-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                        {formatOrderDate(order.orderDate)} · {order.orderId}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() => navigate(getFarmerSectionHash("orders"))}
                      >
                        {t("farmerDashboard.actions.viewOrder")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() =>
                          showToast(
                            t("farmerDashboard.toasts.openingWhatsAppChat", {
                              buyer: translateBuyerName(order.buyer),
                            }),
                          )
                        }
                      >
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        {t("farmerDashboard.actions.contactBuyer")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() => handleUpdateStatus(order.orderId, order.status)}
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        {t("farmerDashboard.actions.updateStatus")}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="agrivo-dashboard-empty py-8">
                <p className="text-sm text-[#5F6F64]">{t("farmerDashboard.buyerActivity.empty.noBuyerOrdersYet")}</p>
                <Button
                  className="mt-4 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => navigate("products")}
                >
                  {t("farmerDashboard.actions.viewMarketplace")}
                </Button>
              </div>
            )}
          </section>

          {/* Product performance */}
          <section className="agrivo-dashboard-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                  {t("farmerDashboard.salesInsights.title")}
                </p>
                <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018]">{t("farmerDashboard.salesInsights.productPerformance")}</h3>
              </div>
              <TrendingUp className="h-5 w-5 text-[#43A047]" />
            </div>

            {farmerProductPerformance.length > 0 ? (
              <div className="space-y-3">
                {farmerProductPerformance.map((product) => (
                  <div key={product.id} className="agrivo-farmer-product-row">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[#102018]">{translateProductName(product.name)}</p>
                        <p className="mt-0.5 text-sm text-[#5F6F64]">{translateSoldLabel(product.soldLabel)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.price ? (
                          <span className="text-xs font-semibold text-[#14532D]">{translatePrice(product.price)}</span>
                        ) : null}
                        <ProductStatusBadge status={product.status} t={t} />
                      </div>
                    </div>
                    <div className="agrivo-farmer-progress-track mt-3">
                      <div
                        className="agrivo-farmer-progress-fill"
                        style={{ width: `${product.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="agrivo-dashboard-empty py-8">
                <p className="text-sm text-[#5F6F64]">{t("farmerDashboard.productPerformance.empty.noProductsListedYet")}</p>
                <Button
                  className="mt-4 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => navigate(getFarmerSectionHash("add-product"))}
                >
                  {t("farmerDashboard.actions.addProduct")}
                </Button>
              </div>
            )}
          </section>
        </div>

        <div className="agrivo-farmer-main-right space-y-6">
          {/* Today's tasks */}
          <section className="agrivo-dashboard-panel agrivo-farmer-tasks-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                  {t("farmerDashboard.dailyOperations.title")}
                </p>
                <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018]">{t("farmerDashboard.dailyOperations.todayTasks")}</h3>
              </div>
            </div>

            <ul className="space-y-2">
              {farmerTodaysTasks.map((task) => (
                <li key={task.id} className="agrivo-farmer-task-row">
                  <span className="agrivo-farmer-task-check" aria-hidden>
                    <CheckSquare className="h-4 w-4 text-[#43A047]" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-[#102018]">
                    {translateTaskText(task.text)}
                  </span>
                  <TaskPriorityBadge priority={task.priority} t={t} />
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="mt-4 w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(getFarmerSectionHash("orders"))}
            >
              {t("farmerDashboard.actions.viewAllTasks")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </section>

          {/* Active farm jobs */}
          <section className="agrivo-dashboard-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                  {t("farmerDashboard.stats.seasonalRoles")}
                </p>
                <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018]">{t("farmerDashboard.jobPosts.title")}</h3>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[#14532D] hover:text-[#1D6A3B]"
                onClick={() => navigate(FARMER_DASHBOARD_JOBS_HASH)}
              >
                {t("farmerDashboard.actions.viewAll")}
              </button>
            </div>

            {farmerActiveJobs.length > 0 ? (
              <div className="space-y-3">
                {farmerActiveJobs.map((job) => (
                  <article key={job.id} className="agrivo-farmer-job-card">
                    <h4 className="font-semibold text-[#102018]">{translateJobTitle(job.title)}</h4>
                    <p className="mt-1 flex items-center gap-1 text-sm text-[#5F6F64]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                      {translateJobLocation(job.location)}
                    </p>
                    <p className="mt-2 text-sm text-[#102018]">
                      {t("farmerDashboard.jobPosts.workersNeeded", { count: job.workersNeeded })} ·{" "}
                      {job.dailyPay} {t("farmerDashboard.jobPosts.dailyPayUnit")}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#14532D]">
                      {t("farmerDashboard.jobPosts.applications", { count: job.applications })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() => navigate(FARMER_DASHBOARD_JOBS_HASH)}
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        {t("farmerDashboard.actions.viewJob")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() => navigate(getFarmerJobEditHash(job.id))}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        {t("farmerDashboard.actions.edit")}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="agrivo-dashboard-empty py-6">
                <p className="text-sm text-[#5F6F64]">{t("farmerDashboard.jobPosts.empty.noActiveJobPosts")}</p>
                <Button
                  className="mt-4 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => navigate(FARMER_DASHBOARD_JOBS_NEW_HASH)}
                >
                  {t("farmerDashboard.actions.createJobPost")}
                </Button>
              </div>
            )}
          </section>

          {/* Stock alerts */}
          <section className="agrivo-dashboard-panel agrivo-farmer-alerts-panel">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#b45309]" />
              <h3 className="agrivo-heading text-lg font-bold text-[#102018]">{t("farmerDashboard.stockAlerts.title")}</h3>
            </div>

            <ul className="space-y-2">
              {farmerStockAlerts.map((alert) => (
                <li key={alert.id} className="agrivo-farmer-alert-row">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#102018]">{translateProductName(alert.product)}</p>
                    <p className="text-sm text-[#5F6F64]">{translateStockMessage(alert.message)}</p>
                  </div>
                  <StockAlertBadge type={alert.type} t={t} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
