import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import {
  getLocalizedProductName,
  getLocalizedVariety,
  translateDeliveryOption,
} from "./farmerProductHelpers";
import type {
  FarmerManagementOrder,
  FarmerManagementOrderStatus,
} from "../app/utils/farmerOrdersStorage";

type LocalizedName = { en: string; az: string };

export type OrderProductFields = Pick<FarmerManagementOrder, "productName" | "variety"> & {
  nameKey?: string;
  nameLocalized?: LocalizedName;
  varietyKey?: string;
  varietyLocalized?: LocalizedName;
};

const STATUS_KEY_MAP: Record<FarmerManagementOrderStatus, string> = {
  pending: "farmerOrders.status.pending",
  accepted: "farmerOrders.status.accepted",
  preparing: "farmerOrders.status.preparing",
  ready_for_pickup: "farmerOrders.status.readyForPickup",
  delivered: "farmerOrders.status.delivered",
  cancelled: "farmerOrders.status.cancelled",
};

export function translateFarmerOrderStatus(
  t: TranslateFn,
  status: FarmerManagementOrderStatus,
): string {
  return t(STATUS_KEY_MAP[status], status);
}

export function translateFarmerOrderDelivery(t: TranslateFn, method: string): string {
  const value = method.trim();
  const lower = value.toLowerCase();

  if (lower === "agrivo logistics") return t("farmerOrders.delivery.agrivoLogistics");
  if (lower === "logistics partner") return t("farmerOrders.delivery.agrivoLogistics");
  if (lower === "buyer pickup" || lower === "pickup from farm") {
    return t("farmerOrders.delivery.pickupFromFarm");
  }
  if (lower === "farmer delivery") return t("farmerOrders.delivery.farmerDelivery");
  if (lower === "no delivery") return t("farmerOrders.delivery.noDelivery");

  const fromProductForm = translateDeliveryOption(t, value);
  if (fromProductForm !== value) return fromProductForm;

  return value;
}

export function translateOrderDateLabel(t: TranslateFn, label: string): string {
  const value = label.trim();
  const lower = value.toLowerCase();

  if (lower === "today") return t("farmerOrders.dates.today");
  if (lower === "yesterday") return t("farmerOrders.dates.yesterday");
  if (lower === "this week") return t("farmerOrders.dates.thisWeek");
  if (lower === "this month") return t("farmerOrders.dates.thisMonth");
  if (lower === "recent") return t("farmerOrders.labels.recent");

  return value;
}

export function formatFarmerOrderPlacedLabel(t: TranslateFn, orderDateLabel: string): string {
  const translated = translateOrderDateLabel(t, orderDateLabel);
  if (orderDateLabel.trim().toLowerCase() === "recent") {
    return t("farmerOrders.modal.placedRecent");
  }
  return t("farmerOrders.modal.placed", { date: translated.toLowerCase() });
}

export function formatFarmerOrderCount(t: TranslateFn, count: number): string {
  if (count === 1) return t("farmerOrders.count.oneOrder");
  return t("farmerOrders.count.orders", { count });
}

export function getLocalizedOrderProductName(
  order: OrderProductFields,
  language: Language,
  t: TranslateFn,
): string {
  return getLocalizedProductName(
    {
      name: order.productName,
      nameKey: order.nameKey,
      nameLocalized: order.nameLocalized,
    },
    language,
    t,
  );
}

export function getLocalizedOrderVariety(
  order: OrderProductFields,
  language: Language,
): string | undefined {
  if (!order.variety) return undefined;
  return getLocalizedVariety(
    {
      variety: order.variety,
      varietyKey: order.varietyKey,
      varietyLocalized: order.varietyLocalized,
    },
    language,
  );
}

export function getPrimaryOrderAction(
  status: FarmerManagementOrderStatus,
  t: TranslateFn,
): { label: string; nextStatus: FarmerManagementOrderStatus } | null {
  switch (status) {
    case "pending":
      return { label: t("farmerOrders.actions.acceptOrder"), nextStatus: "accepted" };
    case "accepted":
      return { label: t("farmerOrders.actions.markAsPreparing"), nextStatus: "preparing" };
    case "preparing":
      return { label: t("farmerOrders.actions.markReadyForPickup"), nextStatus: "ready_for_pickup" };
    case "ready_for_pickup":
      return { label: t("farmerOrders.actions.markAsDelivered"), nextStatus: "delivered" };
    default:
      return null;
  }
}
