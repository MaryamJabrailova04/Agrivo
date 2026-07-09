import { CheckCircle2, ClipboardList, Info, PackagePlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { isApiMode } from "../../../config/dataMode";
import { getOrders, updateOrderStatus, type ApiOrder } from "../../../api/ordersApi";
import { getFarmerSectionHash } from "../../data/farmerDashboard";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatFarmerOrderCount,
  translateFarmerOrderStatus,
} from "../../../i18n/farmerOrderHelpers";
import {
  computeFarmerOrdersSummary,
  filterAndSortFarmerOrders,
  getFarmerOrders,
  resolveFarmerOrdersUserId,
  updateFarmerOrderStatus,
  type FarmerManagementOrder,
  type FarmerManagementOrderStatus,
  type FarmerOrderDateFilter,
  type FarmerOrderSortOption,
} from "../../utils/farmerOrdersStorage";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { OrderCard } from "./farmer-orders/OrderCard";
import { OrderDetailsModal } from "./farmer-orders/OrderDetailsModal";
import { OrdersFilterBar } from "./farmer-orders/OrdersFilterBar";
import { OrderStats } from "./farmer-orders/OrderStats";

function navigate(hash: string) {
  navigateToHash(hash);
}

export function FarmerOrdersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolveFarmerOrdersUserId(user);

  const [orders, setOrders] = useState<FarmerManagementOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FarmerManagementOrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<FarmerOrderDateFilter>("all");
  const [sort, setSort] = useState<FarmerOrderSortOption>("newest");
  const [toast, setToast] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<FarmerManagementOrder | null>(null);
  const [rejectOrder, setRejectOrder] = useState<FarmerManagementOrder | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!userId) return;
    if (isApiMode) {
      getOrders()
        .then((orders) => setOrders(orders.map(mapApiOrderToFarmerOrder)))
        .catch(() => setApiError(t("farmerOrders.feedback.failedLoad")));
      return;
    }
    setOrders(getFarmerOrders(userId));
  }, [userId, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const summary = useMemo(() => computeFarmerOrdersSummary(orders), [orders]);

  const filteredOrders = useMemo(
    () => filterAndSortFarmerOrders(orders, { search, status, dateFilter, sort }),
    [orders, search, status, dateFilter, sort],
  );

  const handleStatusChange = (orderId: string, nextStatus: FarmerManagementOrderStatus) => {
    if (!userId) return;
    if (isApiMode) {
      updateOrderStatus(orderId, mapFarmerStatusToApiStatus(nextStatus))
        .then(() => refresh())
        .catch(() => setApiError(t("farmerOrders.feedback.failedUpdate")));
      return;
    }
    const next = updateFarmerOrderStatus(userId, orderId, nextStatus);
    setOrders(next);
    const order = next.find((item) => item.id === orderId);
    showToast(
      order
        ? t("farmerOrders.feedback.statusUpdated", {
            orderId: order.orderId,
            status: translateFarmerOrderStatus(t, nextStatus),
          })
        : t("farmerOrders.feedback.statusUpdatedGeneric"),
    );
    if (detailOrder?.id === orderId) {
      setDetailOrder(order ?? null);
    }
  };

  const handleReject = () => {
    if (!rejectOrder || !userId) return;
    if (isApiMode) {
      updateOrderStatus(rejectOrder.id, "cancelled")
        .then(() => {
          refresh();
          showToast(t("farmerOrders.feedback.rejected", { orderId: rejectOrder.orderId }));
          setRejectOrder(null);
        })
        .catch(() => setApiError(t("farmerOrders.feedback.failedReject")));
      return;
    }
    const next = updateFarmerOrderStatus(userId, rejectOrder.id, "cancelled");
    setOrders(next);
    showToast(t("farmerOrders.feedback.rejected", { orderId: rejectOrder.orderId }));
    setRejectOrder(null);
    if (detailOrder?.id === rejectOrder.id) {
      setDetailOrder({ ...rejectOrder, status: "cancelled" });
    }
  };

  if (!userId) return null;

  return (
    <div className="agrivo-farmer-orders space-y-6">
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("farmerOrders.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("farmerOrders.subtitle")}
          </p>
        </div>
        <div className="agrivo-farmer-order-info-card">
          <Info className="h-4 w-4 shrink-0 text-[#15803d]" />
          <p className="text-sm font-medium text-[#14532D]">{t("farmerOrders.infoBox")}</p>
        </div>
      </div>

      {orders.length > 0 ? (
        <>
          <OrderStats summary={summary} />

          <section className="agrivo-dashboard-panel">
            <OrdersFilterBar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              sort={sort}
              onSortChange={setSort}
            />
          </section>

          <section className="agrivo-farmer-orders-section">
            <div className="agrivo-farmer-orders-section-header">
              <h3 className="agrivo-heading text-lg font-bold text-[#102018]">
                {t("farmerOrders.section.buyerOrders")}
              </h3>
              <p className="text-sm text-[#6b7a70]">
                {formatFarmerOrderCount(t, filteredOrders.length)}
              </p>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="agrivo-farmer-orders-list">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={setDetailOrder}
                    onStatusChange={handleStatusChange}
                    onReject={setRejectOrder}
                  />
                ))}
              </div>
            ) : (
              <div className="agrivo-dashboard-empty agrivo-farmer-orders-empty-filter">
                <ClipboardList className="h-10 w-10 text-[#86efac]" strokeWidth={1.5} />
                <h4 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">
                  {t("farmerOrders.empty.noMatchTitle")}
                </h4>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                  {t("farmerOrders.empty.noMatchSubtitle")}
                </p>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="agrivo-dashboard-panel">
          <div className="agrivo-dashboard-empty">
            <ClipboardList className="h-12 w-12 text-[#86efac]" strokeWidth={1.5} />
            <h3 className="agrivo-heading mt-4 text-xl font-bold text-[#102018]">
              {t("farmerOrders.empty.noOrdersTitle")}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#5F6F64]">
              {t("farmerOrders.empty.noOrdersSubtitle")}
            </p>
            <Button
              className="agrivo-button-soft mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate(getFarmerSectionHash("add-product"))}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {t("farmerOrders.empty.addProduct")}
            </Button>
          </div>
        </div>
      )}

      <OrderDetailsModal
        order={detailOrder}
        open={Boolean(detailOrder)}
        onOpenChange={(open) => {
          if (!open) setDetailOrder(null);
        }}
      />

      <Dialog open={Boolean(rejectOrder)} onOpenChange={(open) => !open && setRejectOrder(null)}>
        <DialogContent className="agrivo-profile-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {t("farmerOrders.reject.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F6F64]">
              {rejectOrder
                ? t("farmerOrders.reject.description", {
                    orderId: rejectOrder.orderId,
                    buyerName: rejectOrder.buyerName,
                  })
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => setRejectOrder(null)}
            >
              {t("farmerOrders.reject.keepOrder")}
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#b91c1c] text-white hover:bg-[#991b1b]"
              onClick={handleReject}
            >
              {t("farmerOrders.reject.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function mapApiOrderStatus(status: ApiOrder["status"]): FarmerManagementOrderStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "accepted":
      return "accepted";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready_for_pickup";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapFarmerStatusToApiStatus(status: FarmerManagementOrderStatus): ApiOrder["status"] {
  switch (status) {
    case "ready_for_pickup":
      return "ready";
    default:
      return status;
  }
}

function mapApiOrderToFarmerOrder(order: ApiOrder): FarmerManagementOrder {
  const item = order.items[0];
  return {
    id: order.id,
    orderId: order.id.slice(-8).toUpperCase(),
    buyerName: "Buyer",
    buyerType: "Buyer",
    productName: item?.productName ?? "Products",
    nameKey: item?.nameKey,
    nameLocalized: item?.nameLocalized,
    variety: item?.variety ?? undefined,
    varietyKey: item?.varietyKey,
    varietyLocalized: item?.varietyLocalized,
    quantity: item?.quantity ?? 0,
    unit: item?.unit ?? "kg",
    pricePerUnit: item?.pricePerUnit ?? 0,
    totalPrice: order.totalAmount,
    deliveryMethod: order.deliveryMethod ?? "Agrivo logistics",
    deliveryAddress: order.deliveryAddress ?? "Delivery address",
    status: mapApiOrderStatus(order.status),
    orderDateLabel: "Recent",
    orderDateIso: order.createdAt,
  };
}
