import type { AuthUser } from "../auth/authStorage";

export type FarmerManagementOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled";

export type FarmerOrderDateFilter = "all" | "today" | "week" | "month";
export type FarmerOrderSortOption = "newest" | "oldest" | "value-desc";

type LocalizedName = { en: string; az: string };

export interface FarmerManagementOrder {
  id: string;
  orderId: string;
  buyerName: string;
  buyerType: string;
  buyerPhone?: string;
  buyerEmail?: string;
  productName: string;
  nameKey?: string;
  nameLocalized?: LocalizedName;
  variety?: string;
  varietyKey?: string;
  varietyLocalized?: LocalizedName;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  deliveryMethod: string;
  deliveryAddress: string;
  status: FarmerManagementOrderStatus;
  orderDateLabel: string;
  orderDateIso: string;
  farmerNotes?: string;
}

export interface FarmerOrdersSummary {
  total: number;
  pending: number;
  preparing: number;
  completed: number;
}

const STORAGE_KEY_PREFIX = "agrivo_farmer_orders_";

export const FARMER_ORDER_STATUS_LABELS: Record<FarmerManagementOrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function seedFarmerOrders(): FarmerManagementOrder[] {
  return [
    {
      id: "fo-m-1",
      orderId: "AGR-1024",
      buyerName: "Green Market Baku",
      buyerType: "Supermarket",
      buyerPhone: "+994 50 123 45 67",
      buyerEmail: "orders@greenmarket.az",
      productName: "Tomatoes",
      variety: "Çerri Pomidor",
      quantity: 120,
      unit: "kg",
      pricePerUnit: 2.5,
      totalPrice: 300,
      deliveryMethod: "Logistics partner",
      deliveryAddress: "Baku, Narimanov",
      status: "pending",
      orderDateLabel: "Today",
      orderDateIso: "2026-07-06T09:30:00.000Z",
    },
    {
      id: "fo-m-2",
      orderId: "AGR-1025",
      buyerName: "Fresh Bazaar",
      buyerType: "Bazaar seller",
      buyerPhone: "+994 55 234 56 78",
      buyerEmail: "supply@freshbazaar.az",
      productName: "Apple",
      variety: "Qızıl Əhmədi",
      quantity: 80,
      unit: "kg",
      pricePerUnit: 2,
      totalPrice: 160,
      deliveryMethod: "Buyer pickup",
      deliveryAddress: "Sumqayıt, City Market",
      status: "preparing",
      orderDateLabel: "Yesterday",
      orderDateIso: "2026-07-05T14:15:00.000Z",
      farmerNotes: "Pack in ventilated crates.",
    },
    {
      id: "fo-m-3",
      orderId: "AGR-1026",
      buyerName: "Roadside Fruit Seller",
      buyerType: "Roadside seller",
      buyerPhone: "+994 70 345 67 89",
      productName: "Watermelon",
      variety: "Sabirabad Qarpızı",
      quantity: 500,
      unit: "kg",
      pricePerUnit: 0.9,
      totalPrice: 450,
      deliveryMethod: "Farmer delivery",
      deliveryAddress: "Baku, Sabail district",
      status: "delivered",
      orderDateLabel: "This week",
      orderDateIso: "2026-07-03T11:00:00.000Z",
    },
    {
      id: "fo-m-4",
      orderId: "AGR-1027",
      buyerName: "City Grocery Chain",
      buyerType: "Supermarket",
      buyerPhone: "+994 12 456 78 90",
      buyerEmail: "procurement@citygrocery.az",
      productName: "Potato",
      variety: "Gədəbəy Kartofu",
      quantity: 200,
      unit: "kg",
      pricePerUnit: 0.85,
      totalPrice: 170,
      deliveryMethod: "Logistics partner",
      deliveryAddress: "Baku, Yasamal",
      status: "accepted",
      orderDateLabel: "This week",
      orderDateIso: "2026-07-04T08:45:00.000Z",
    },
    {
      id: "fo-m-5",
      orderId: "AGR-1028",
      buyerName: "Organic Corner",
      buyerType: "Retail shop",
      buyerPhone: "+994 51 567 89 01",
      buyerEmail: "hello@organiccorner.az",
      productName: "Pomegranate",
      variety: "Gülöyşə",
      quantity: 60,
      unit: "kg",
      pricePerUnit: 3.5,
      totalPrice: 210,
      deliveryMethod: "Buyer pickup",
      deliveryAddress: "Ganja, Central bazaar",
      status: "ready_for_pickup",
      orderDateLabel: "Today",
      orderDateIso: "2026-07-06T07:20:00.000Z",
      farmerNotes: "Buyer arriving after 3 PM.",
    },
    {
      id: "fo-m-6",
      orderId: "AGR-1029",
      buyerName: "Neighborhood Market",
      buyerType: "Local shop",
      buyerPhone: "+994 55 678 90 12",
      productName: "Cucumber",
      variety: "Kornişon",
      quantity: 45,
      unit: "kg",
      pricePerUnit: 1.6,
      totalPrice: 72,
      deliveryMethod: "Farmer delivery",
      deliveryAddress: "Quba, Alpan village route",
      status: "cancelled",
      orderDateLabel: "This month",
      orderDateIso: "2026-06-28T16:30:00.000Z",
      farmerNotes: "Buyer cancelled due to schedule change.",
    },
  ];
}

export function resolveFarmerOrdersUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_farmer";
}

export function getFarmerOrders(userId: string): FarmerManagementOrder[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const seeded = seedFarmerOrders();
      setFarmerOrders(userId, seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as FarmerManagementOrder[];
    return Array.isArray(parsed) ? parsed : seedFarmerOrders();
  } catch {
    return seedFarmerOrders();
  }
}

export function setFarmerOrders(userId: string, orders: FarmerManagementOrder[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(orders));
}

export function updateFarmerOrderStatus(
  userId: string,
  orderId: string,
  status: FarmerManagementOrderStatus,
): FarmerManagementOrder[] {
  const orders = getFarmerOrders(userId);
  const next = orders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  setFarmerOrders(userId, next);
  return next;
}

export function computeFarmerOrdersSummary(orders: FarmerManagementOrder[]): FarmerOrdersSummary {
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    completed: orders.filter((order) => order.status === "delivered").length,
  };
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function matchesDateFilter(order: FarmerManagementOrder, filter: FarmerOrderDateFilter): boolean {
  if (filter === "all") return true;

  const orderDate = new Date(order.orderDateIso);
  const now = new Date();
  const today = startOfDay(now);

  if (filter === "today") {
    return startOfDay(orderDate).getTime() === today.getTime();
  }

  if (filter === "week") {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  }

  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return orderDate >= monthAgo;
}

export function filterAndSortFarmerOrders(
  orders: FarmerManagementOrder[],
  options: {
    search: string;
    status: FarmerManagementOrderStatus | "all";
    dateFilter: FarmerOrderDateFilter;
    sort: FarmerOrderSortOption;
  },
): FarmerManagementOrder[] {
  const query = options.search.trim().toLowerCase();

  let results = orders.filter((order) => {
    const matchesSearch =
      !query ||
      order.orderId.toLowerCase().includes(query) ||
      order.buyerName.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query) ||
      order.variety?.toLowerCase().includes(query);

    const matchesStatus = options.status === "all" || order.status === options.status;
    const matchesDate = matchesDateFilter(order, options.dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  results = [...results].sort((a, b) => {
    if (options.sort === "oldest") {
      return new Date(a.orderDateIso).getTime() - new Date(b.orderDateIso).getTime();
    }
    if (options.sort === "value-desc") {
      return b.totalPrice - a.totalPrice;
    }
    return new Date(b.orderDateIso).getTime() - new Date(a.orderDateIso).getTime();
  });

  return results;
}

export function formatOrderCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} AZN`;
}

export function formatOrderQuantity(order: FarmerManagementOrder): string {
  return `${order.quantity} ${order.unit}`;
}
