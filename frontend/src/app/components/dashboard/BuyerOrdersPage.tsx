import { MessageCircle, RotateCcw, Search, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateStatus } from "../../../i18n/status";
import {
  formatLocalizedQuantity,
  translateBuyerProductName,
  translateBuyerRoute,
} from "../../../i18n/buyerDashboardHelpers";
import { isApiMode } from "../../../config/dataMode";
import { getOrders, type ApiOrder } from "../../../api/ordersApi";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  getAllBuyerOrders,
  buyerOrderTimelineLabels,
  getBuyerOrderDetailHash,
  isActiveBuyerOrder,
  showsOrderTimeline,
  type BuyerOrder,
  type BuyerOrderStatus,
} from "../../data/buyerDashboard";
import { BuyerOrderStatusBadge } from "./BuyerOrderStatusBadge";
import { ProductImage } from "../products/ProductImage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";

type OrderTab = "all" | "active" | "in-transit" | "delivered" | "cancelled";

const filterTriggerClass =
  "agrivo-filter-control h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

const tabs: Array<{ id: OrderTab; labelKey: string }> = [
  { id: "all", labelKey: "orders.allOrders" },
  { id: "active", labelKey: "orders.active" },
  { id: "in-transit", labelKey: "status.inTransit" },
  { id: "delivered", labelKey: "status.delivered" },
  { id: "cancelled", labelKey: "status.cancelled" },
];

function getTabCount(tab: OrderTab, orders: BuyerOrder[]): number {
  switch (tab) {
    case "all":
      return orders.length;
    case "active":
      return orders.filter((o) => isActiveBuyerOrder(o.status)).length;
    case "in-transit":
      return orders.filter((o) => o.status === "In Transit").length;
    case "delivered":
      return orders.filter((o) => o.status === "Delivered").length;
    case "cancelled":
      return orders.filter((o) => o.status === "Cancelled").length;
    default:
      return 0;
  }
}

function matchesTab(order: BuyerOrder, tab: OrderTab): boolean {
  switch (tab) {
    case "all":
      return true;
    case "active":
      return isActiveBuyerOrder(order.status);
    case "in-transit":
      return order.status === "In Transit";
    case "delivered":
      return order.status === "Delivered";
    case "cancelled":
      return order.status === "Cancelled";
    default:
      return true;
  }
}

function OrderTimeline({ timelineIndex }: { timelineIndex: number }) {
  const { t } = useLanguage();
  return (
    <div className="agrivo-buyer-order-timeline">
      {buyerOrderTimelineLabels.map((label, index) => {
        const isDone = index < timelineIndex;
        const isCurrent = index === timelineIndex;

        return (
          <div key={label} className="agrivo-buyer-order-timeline-step">
            <div className="agrivo-buyer-order-timeline-marker-wrap">
              <span
                className={cn(
                  "agrivo-buyer-order-timeline-marker",
                  isDone && "agrivo-buyer-order-timeline-marker--done",
                  isCurrent && "agrivo-buyer-order-timeline-marker--current",
                )}
              />
              {index < buyerOrderTimelineLabels.length - 1 ? (
                <span
                  className={cn(
                    "agrivo-buyer-order-timeline-line",
                    isDone && "agrivo-buyer-order-timeline-line--done",
                  )}
                />
              ) : null}
            </div>
            <p
              className={cn(
                "text-[10px] font-semibold sm:text-xs",
                isCurrent ? "text-[#14532D]" : isDone ? "text-[#166534]" : "text-[#9ca3af]",
              )}
            >
              {label === "Picked Up" ? t("status.pickedUp") : label === "In Transit" ? t("status.inTransit") : label === "Confirmed" ? t("status.confirmed") : label === "Packed" ? t("status.preparing") : label === "Delivered" ? t("status.delivered") : label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: BuyerOrder }) {
  const { t, language } = useLanguage();
  const isDelivered = order.status === "Delivered";
  const isCancelled = order.status === "Cancelled";
  const isActive = showsOrderTimeline(order.status);

  return (
    <article className="agrivo-buyer-order-full-card agrivo-card">
      <div className="agrivo-buyer-order-full-top">
        <div className="agrivo-buyer-order-thumb">
          <ProductImage
            name={order.product}
            src={order.image}
            alt={`${order.product} product image`}
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="agrivo-heading text-lg font-bold text-[#102018]">
                {translateBuyerProductName(t, order.product)} · {formatLocalizedQuantity(t, language, order.quantity)}
              </h3>
              <p className="mt-1 text-sm text-[#5F6F64]">{t("buyerDashboard.recentOrders.farmer")}: {order.farmer}</p>
            </div>
            <BuyerOrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="agrivo-buyer-order-full-meta">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">Order ID</p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{order.orderId}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{t("orders.orderedOn", "Ordered on")}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{order.orderDate}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{t("orders.deliveryTo", "Delivery to")}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{order.deliveryTo}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{t("buyerDashboard.currentDelivery.route")}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">{translateBuyerRoute(t, order.route)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{t("buyerDashboard.recentOrders.total")}</p>
          <p className="mt-0.5 text-sm font-bold text-[#14532D]">{order.total}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {isDelivered ? t("status.delivered") : t("orders.estimatedDelivery", "Est. delivery")}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#102018]">
            {isDelivered
              ? order.deliveredDate
                ? `${t("orders.deliveredOn", "Delivered on")} ${order.deliveredDate}`
                : t("status.delivered")
              : order.estimatedDelivery ?? "—"}
          </p>
        </div>
      </div>

      {isActive ? <OrderTimeline timelineIndex={order.timelineIndex} /> : null}

      {isDelivered && order.deliveredDate ? (
        <p className="rounded-xl border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-xs font-semibold text-[#166534]">
          {t("orders.deliveredOn", "Delivered on")} {order.deliveredDate}
        </p>
      ) : null}

      <div className="agrivo-buyer-order-actions">
        <Button
          className="agrivo-button-soft rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={() => {
            navigateToHash(getBuyerOrderDetailHash(order.orderId));
          }}
        >
          {t("buyerDashboard.recentOrders.viewDetails")}
        </Button>

        {isActive && order.status === "In Transit" ? (
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          >
            <Truck className="mr-2 h-4 w-4" />
            {t("buyerDashboard.recentOrders.trackOrder")}
          </Button>
        ) : null}

        {isActive ? (
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {t("orders.contactLogistics", "Contact Logistics")}
          </Button>
        ) : null}

        {isDelivered ? (
          <>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("orders.reorder", "Reorder")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {t("orders.contactFarmer", "Contact Farmer")}
            </Button>
          </>
        ) : null}

        {!isDelivered && !isCancelled && order.status !== "In Transit" ? (
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {t("orders.contactFarmer", "Contact Farmer")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function BuyerOrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [apiOrders, setApiOrders] = useState<BuyerOrder[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const buyerAllOrders = useMemo(
    () => (isApiMode ? apiOrders : getAllBuyerOrders(user?.id)),
    [apiOrders, user?.id],
  );
  const [orderSuccessToast, setOrderSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiMode) return;
    getOrders()
      .then((orders) => setApiOrders(orders.map(mapApiOrderToBuyerOrder)))
      .catch((error) =>
        setApiError(error instanceof Error ? error.message : "Failed to load orders."),
      );
  }, []);

  useEffect(() => {
    const message = sessionStorage.getItem("agrivo_order_success");
    if (message) {
      sessionStorage.removeItem("agrivo_order_success");
      setOrderSuccessToast(message);
      window.setTimeout(() => setOrderSuccessToast(null), 3200);
    }
  }, []);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const locations = useMemo(
    () => [...new Set(buyerAllOrders.map((o) => o.deliveryTo))].sort(),
    [],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    let results = buyerAllOrders.filter((order) => {
      if (!matchesTab(order, activeTab)) return false;

      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      if (locationFilter !== "all" && order.deliveryTo !== locationFilter) return false;

      if (dateFilter === "july" && order.orderDateSort < 20260701) return false;
      if (dateFilter === "june" && (order.orderDateSort < 20260601 || order.orderDateSort >= 20260701)) {
        return false;
      }

      if (!query) return true;

      return (
        order.product.toLowerCase().includes(query) ||
        order.farmer.toLowerCase().includes(query) ||
        order.orderId.toLowerCase().includes(query) ||
        order.deliveryTo.toLowerCase().includes(query)
      );
    });

    results = [...results].sort((a, b) =>
      sortOrder === "newest" ? b.orderDateSort - a.orderDateSort : a.orderDateSort - b.orderDateSort,
    );

    return results;
  }, [activeTab, search, statusFilter, dateFilter, locationFilter, sortOrder]);

  return (
    <div className="agrivo-buyer-orders space-y-6">
      {orderSuccessToast ? (
        <p className="rounded-xl border border-[#bbf7d0] bg-[#ecfdf5] px-4 py-3 text-sm font-medium text-[#166534]">
          {orderSuccessToast}
        </p>
      ) : null}
      {apiError ? (
        <p className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#b91c1c]">
          {apiError}
        </p>
      ) : null}
      <section className="agrivo-dashboard-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">{t("orders.title")}</p>
        <h2 className="agrivo-heading mt-1 text-2xl font-bold text-[#102018] sm:text-3xl">{t("orders.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
          {t("buyerDashboard.ordersPage.subtitle")}
        </p>

        <div className="agrivo-buyer-order-tabs mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "agrivo-buyer-order-tab",
                activeTab === tab.id && "agrivo-buyer-order-tab--active",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {t(tab.labelKey)} ({getTabCount(tab.id, buyerAllOrders)})
            </button>
          ))}
        </div>
      </section>

      <section className="agrivo-dashboard-panel">
        <div className="agrivo-buyer-order-filters">
          <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a70]" />
            <Input
              className={`${filterTriggerClass} pl-11`}
              placeholder={t("orders.searchPlaceholder", "Search by product, farmer, or order ID...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`${filterTriggerClass} w-full sm:w-[160px]`}>
              <SelectValue placeholder={t("orders.status", "Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("orders.allStatuses", "All statuses")}</SelectItem>
              {(
                [
                  "Pending",
                  "Confirmed",
                  "Preparing",
                  "Pickup Scheduled",
                  "In Transit",
                  "Delivered",
                  "Cancelled",
                ] as BuyerOrderStatus[]
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  {translateStatus(t, status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className={`${filterTriggerClass} w-full sm:w-[150px]`}>
              <SelectValue placeholder={t("orders.dateRange", "Date range")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("orders.allDates", "All dates")}</SelectItem>
              <SelectItem value="july">{t("orders.july2026", "July 2026")}</SelectItem>
              <SelectItem value="june">{t("orders.june2026", "June 2026")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className={`${filterTriggerClass} w-full sm:w-[200px]`}>
              <SelectValue placeholder={t("orders.location", "Location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("orders.allLocations", "All locations")}</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
            <SelectTrigger className={`${filterTriggerClass} w-full sm:w-[160px]`}>
              <SelectValue placeholder={t("orders.sort", "Sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("orders.newestFirst", "Newest first")}</SelectItem>
              <SelectItem value="oldest">{t("orders.oldestFirst", "Oldest first")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : buyerAllOrders.length === 0 ? (
        <section className="agrivo-dashboard-panel">
          <div className="agrivo-dashboard-empty py-12">
            <h3 className="agrivo-heading text-xl font-bold text-[#102018]">
              {t("orders.emptyTitle", "You have not placed any orders yet.")}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F64]">
              {t("orders.emptySubtitle", "Browse the marketplace to order fresh products from verified farmers.")}
            </p>
            <Button
              className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => {
                navigateToHash("products");
              }}
            >
              {t("buyerDashboard.hero.browseMarketplace")}
            </Button>
          </div>
        </section>
      ) : (
        <section className="agrivo-dashboard-panel">
          <div className="agrivo-dashboard-empty py-12">
            <h3 className="agrivo-heading text-xl font-bold text-[#102018]">{t("orders.noMatchTitle", "No orders match your filters")}</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F64]">
              {t("orders.noMatchSubtitle", "Try adjusting your search, status, or date filters to find what you are looking for.")}
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => {
                setActiveTab("all");
                setSearch("");
                setStatusFilter("all");
                setDateFilter("all");
                setLocationFilter("all");
                setSortOrder("newest");
              }}
            >
              {t("orders.clearFilters", "Clear filters")}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function mapApiStatus(status: ApiOrder["status"]): BuyerOrderStatus {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Pickup Scheduled";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function mapApiOrderToBuyerOrder(order: ApiOrder): BuyerOrder {
  const first = order.items[0];
  const date = new Date(order.createdAt);
  const dateSort = Number(
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`,
  );
  return {
    id: order.id,
    orderId: order.id.slice(-8).toUpperCase(),
    product: first?.productName ?? "Products",
    quantity: first ? `${first.quantity} ${first.unit}` : "—",
    farmer: "Farmer",
    total: `${order.totalAmount.toFixed(2)} AZN`,
    route: "Farm → Buyer",
    deliveryTo: order.deliveryAddress ?? "Buyer address",
    status: mapApiStatus(order.status),
    orderDate: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    orderDateSort: dateSort,
    estimatedDelivery: undefined,
    deliveredDate: order.status === "delivered" ? date.toLocaleDateString("en-US") : undefined,
    image: undefined,
    timelineIndex: 0,
  };
}
