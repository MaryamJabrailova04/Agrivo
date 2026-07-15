import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ClipboardList, Heart, Package, ShoppingCart, Truck } from "lucide-react";
import { findPlacedOrder, getPlacedOrders } from "../utils/buyerPlacedOrdersStorage";

export type BuyerOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Pickup Scheduled"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

export interface BuyerSummaryStat {
  id: string;
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export interface BuyerOrder {
  id: string;
  orderId: string;
  product: string;
  quantity: string;
  farmer: string;
  total: string;
  route: string;
  deliveryTo: string;
  status: BuyerOrderStatus;
  orderDate: string;
  orderDateSort: number;
  estimatedDelivery?: string;
  deliveredDate?: string;
  image?: string;
  timelineIndex: number;
  deliveryMethod?: import("./deliveryTypes").DeliveryMethod;
  deliveryFee?: number;
}

export interface BuyerTrackingStep {
  label: string;
  complete: boolean;
  current: boolean;
}

export interface BuyerProductPreview {
  id: string;
  name: string;
  farmer: string;
  price: string;
  location: string;
  image?: string;
}

export const buyerSummaryStats: BuyerSummaryStat[] = [
  { id: "active", label: "Active Orders", value: "3", hint: "Awaiting delivery", icon: ClipboardList },
  { id: "cart", label: "Cart Items", value: "0", hint: "Ready to order", icon: ShoppingCart },
  { id: "saved", label: "Saved Products", value: "12", hint: "From verified farmers", icon: Heart },
  { id: "completed", label: "Completed Orders", value: "28", hint: "All time", icon: CheckCircle2 },
  { id: "pending", label: "Pending Deliveries", value: "2", hint: "In transit", icon: Truck },
];

export const buyerCurrentDelivery = {
  product: "Tomatoes",
  quantity: "80 kg",
  farmer: "Safarova Orchard Hills",
  status: "In Transit" as BuyerOrderStatus,
  estimatedDelivery: "Today, 18:00",
  route: "Quba → Baku",
  orderId: "AGR-2048",
};

export const buyerTrackingSteps: BuyerTrackingStep[] = [
  { label: "Confirmed", complete: true, current: false },
  { label: "Picked up", complete: true, current: false },
  { label: "In transit", complete: false, current: true },
  { label: "Delivered", complete: false, current: false },
];

export const buyerOrderTimelineLabels = [
  "Confirmed",
  "Packed",
  "Picked Up",
  "In Transit",
  "Delivered",
] as const;

export const buyerAllOrders: BuyerOrder[] = [
  {
    id: "ord-1",
    orderId: "AGR-2048",
    product: "Tomatoes",
    quantity: "80 kg",
    farmer: "Safarova Orchard Hills",
    total: "112 AZN",
    route: "Quba → Baku",
    deliveryTo: "Green Market Baku",
    status: "In Transit",
    orderDate: "July 12, 2026",
    orderDateSort: 20260712,
    estimatedDelivery: "Today, 18:00",
    image: "https://images.unsplash.com/photo-1546094097-3c1b07688fd3?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 3,
  },
  {
    id: "ord-2",
    orderId: "AGR-2031",
    product: "Apples",
    quantity: "60 kg",
    farmer: "Aysel Mammadova",
    total: "102 AZN",
    route: "Quba → Sumqayıt",
    deliveryTo: "Sumqayıt Produce Hub",
    status: "Delivered",
    orderDate: "July 14, 2026",
    orderDateSort: 20260714,
    deliveredDate: "July 14, 2026",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-3",
    orderId: "AGR-2019",
    product: "Potatoes",
    quantity: "120 kg",
    farmer: "Ganja Root Fields",
    total: "108 AZN",
    route: "Gəncə → Bakı",
    deliveryTo: "Baku Wholesale Center",
    status: "Delivered",
    orderDate: "July 8, 2026",
    orderDateSort: 20260708,
    deliveredDate: "July 10, 2026",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-4",
    orderId: "AGR-2012",
    product: "Cucumbers",
    quantity: "45 kg",
    farmer: "Ali Hasanov",
    total: "67 AZN",
    route: "Lənkəran → Bakı",
    deliveryTo: "Restaurant Supply Co.",
    status: "Pickup Scheduled",
    orderDate: "July 13, 2026",
    orderDateSort: 20260713,
    estimatedDelivery: "July 15, 2026",
    image: "https://images.unsplash.com/photo-1449307239951-6580b87be850?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 2,
  },
  {
    id: "ord-5",
    orderId: "AGR-1998",
    product: "Pears",
    quantity: "30 kg",
    farmer: "Orchard Valley Farm",
    total: "54 AZN",
    route: "Şəki → Gəncə",
    deliveryTo: "Gəncə City Market",
    status: "Preparing",
    orderDate: "July 14, 2026",
    orderDateSort: 20260714,
    estimatedDelivery: "July 17, 2026",
    image: "https://images.unsplash.com/photo-1514750153128-beb0894c4daf?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 1,
  },
  {
    id: "ord-6",
    orderId: "AGR-1985",
    product: "Honey",
    quantity: "20 jars",
    farmer: "Murad Karimov",
    total: "180 AZN",
    route: "Şəki → Bakı",
    deliveryTo: "Baku Deli Group",
    status: "Delivered",
    orderDate: "July 1, 2026",
    orderDateSort: 20260701,
    deliveredDate: "July 3, 2026",
    image: "https://images.unsplash.com/photo-1587049352846-4a22242a09a5?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-7",
    orderId: "AGR-1972",
    product: "Cherries",
    quantity: "50 kg",
    farmer: "Safarova Orchard Hills",
    total: "170 AZN",
    route: "Quba → Baku",
    deliveryTo: "Green Market Baku",
    status: "Delivered",
    orderDate: "June 28, 2026",
    orderDateSort: 20260628,
    deliveredDate: "June 30, 2026",
    image: "https://images.unsplash.com/photo-1528821122594-5f7621e0b708?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-8",
    orderId: "AGR-1960",
    product: "Carrots",
    quantity: "90 kg",
    farmer: "Ganja Root Fields",
    total: "86 AZN",
    route: "Gəncə → Bakı",
    deliveryTo: "Baku Wholesale Center",
    status: "Cancelled",
    orderDate: "June 25, 2026",
    orderDateSort: 20260625,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a594c0?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 0,
  },
  {
    id: "ord-9",
    orderId: "AGR-1954",
    product: "Tomatoes",
    quantity: "40 kg",
    farmer: "Lankaran Greenhouse Co.",
    total: "56 AZN",
    route: "Lənkəran → Bakı",
    deliveryTo: "Local Produce Shop",
    status: "Confirmed",
    orderDate: "July 15, 2026",
    orderDateSort: 20260715,
    estimatedDelivery: "July 18, 2026",
    image: "https://images.unsplash.com/photo-1546094097-3c1b07688fd3?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 0,
  },
  {
    id: "ord-10",
    orderId: "AGR-1940",
    product: "Apples",
    quantity: "75 kg",
    farmer: "Quba Orchard Farm",
    total: "128 AZN",
    route: "Quba → Baku",
    deliveryTo: "Green Market Baku",
    status: "Delivered",
    orderDate: "June 20, 2026",
    orderDateSort: 20260620,
    deliveredDate: "June 22, 2026",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-11",
    orderId: "AGR-1928",
    product: "Potatoes",
    quantity: "200 kg",
    farmer: "Ganja Root Fields",
    total: "190 AZN",
    route: "Gəncə → Bakı",
    deliveryTo: "Baku Wholesale Center",
    status: "Delivered",
    orderDate: "June 15, 2026",
    orderDateSort: 20260615,
    deliveredDate: "June 17, 2026",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
  {
    id: "ord-12",
    orderId: "AGR-1915",
    product: "Cucumbers",
    quantity: "60 kg",
    farmer: "Ali Hasanov",
    total: "72 AZN",
    route: "Lənkəran → Bakı",
    deliveryTo: "Restaurant Supply Co.",
    status: "Delivered",
    orderDate: "June 10, 2026",
    orderDateSort: 20260610,
    deliveredDate: "June 12, 2026",
    image: "https://images.unsplash.com/photo-1449307239951-6580b87be850?auto=format&fit=crop&w=400&h=300&q=80",
    timelineIndex: 4,
  },
];

export function isActiveBuyerOrder(status: BuyerOrderStatus): boolean {
  return !["Delivered", "Cancelled", "In Transit"].includes(status);
}

export function showsOrderTimeline(status: BuyerOrderStatus): boolean {
  return ["Confirmed", "Preparing", "Pickup Scheduled", "In Transit"].includes(status);
}

export const buyerRecentOrders: BuyerOrder[] = buyerAllOrders.slice(0, 4);

export const buyerRecommendedProducts: BuyerProductPreview[] = [
  {
    id: "rec-1",
    name: "Carrots",
    farmer: "Ganja Root Fields",
    price: "1.20 AZN/kg",
    location: "Gəncə",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a594c0?auto=format&fit=crop&w=800&h=600&q=80",
  },
  {
    id: "rec-2",
    name: "Cherries",
    farmer: "Safarova Orchard Hills",
    price: "3.40 AZN/kg",
    location: "Quba",
    image: "https://images.unsplash.com/photo-1528821122594-5f7621e0b708?auto=format&fit=crop&w=800&h=600&q=80",
  },
  {
    id: "rec-3",
    name: "Potatoes",
    farmer: "Ganja Root Fields",
    price: "0.95 AZN/kg",
    location: "Gəncə",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&h=600&q=80",
  },
  {
    id: "rec-4",
    name: "Apples",
    farmer: "Safarova Orchard Hills",
    price: "1.70 AZN/kg",
    location: "Quba",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&h=600&q=80",
  },
];

export const buyerSavedProducts: BuyerProductPreview[] = [
  {
    id: "saved-1",
    name: "Tomatoes",
    farmer: "Safarova Orchard Hills",
    price: "1.40 AZN/kg",
    location: "Quba",
  },
  {
    id: "saved-2",
    name: "Cucumbers",
    farmer: "Lankaran Greenhouse Co.",
    price: "0.85 AZN/kg",
    location: "Lankaran",
  },
  {
    id: "saved-3",
    name: "Pears",
    farmer: "Quba Orchard Farm",
    price: "2.10 AZN/kg",
    location: "Quba",
  },
];

export type BuyerOrderTimelineStepStatus = "complete" | "current" | "pending" | "cancelled";

export interface BuyerOrderTimelineStep {
  label: string;
  status: BuyerOrderTimelineStepStatus;
  datetime?: string;
}

export interface BuyerOrderDetail extends BuyerOrder {
  category: string;
  unitPrice: string;
  subtotal: string;
  deliveryFee: string;
  serviceFee: string;
  grandTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  harvestDate: string;
  batchId: string;
  freshnessNote: string;
  deliveryAddress: string;
  logisticsPartner: string;
  deliveryContact: string;
  deliveryNotes: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDistance: string;
  estimatedTime: string;
  farmerSlug: string;
  farmerLocation: string;
  farmerRating: number;
  farmerCompletedOrders: number;
  farmerSpecialization: string;
  farmerVerified: boolean;
  cancelledAt?: string;
  cancelledReason?: string;
  timelineSteps: BuyerOrderTimelineStep[];
}

const productCategoryMap: Record<string, string> = {
  Tomatoes: "Vegetables",
  Potatoes: "Vegetables",
  Cucumbers: "Vegetables",
  Carrots: "Vegetables",
  Apples: "Fruits",
  Pears: "Fruits",
  Cherries: "Fruits",
  Honey: "Pantry & Specialty",
};

const farmerSlugOverrides: Record<string, string> = {
  "Safarova Orchard Hills": "nigar-safarova",
  "Ganja Root Fields": "leyla-abbasova",
  "Lankaran Greenhouse Co.": "ali-hasanov",
  "Orchard Valley Farm": "aysel-mammadova",
  "Quba Orchard Farm": "nigar-safarova",
};

const orderDetailOverrides: Partial<
  Record<
    string,
    Partial<
      Pick<
        BuyerOrderDetail,
        | "unitPrice"
        | "subtotal"
        | "deliveryFee"
        | "serviceFee"
        | "grandTotal"
        | "paymentMethod"
        | "paymentStatus"
        | "harvestDate"
        | "batchId"
        | "freshnessNote"
        | "deliveryAddress"
        | "logisticsPartner"
        | "deliveryContact"
        | "deliveryNotes"
        | "pickupLocation"
        | "dropoffLocation"
        | "estimatedDistance"
        | "estimatedTime"
        | "farmerLocation"
        | "farmerRating"
        | "farmerCompletedOrders"
        | "farmerSpecialization"
        | "cancelledAt"
        | "cancelledReason"
      >
    >
  >
> = {
  "AGR-1954": {
    unitPrice: "1.40 AZN / kg",
    subtotal: "56 AZN",
    deliveryFee: "6 AZN",
    serviceFee: "0 AZN",
    grandTotal: "62 AZN",
    paymentMethod: "Cash on delivery",
    paymentStatus: "Pending",
    harvestDate: "July 14, 2026",
    batchId: "AGR-BATCH-2048",
    freshnessNote: "Harvested within 24 hours before pickup",
    deliveryAddress: "Local Produce Shop, Baku",
    logisticsPartner: "Agrivo Delivery Team",
    deliveryContact: "+994 50 123 45 67",
    deliveryNotes: "Please call buyer before arrival.",
    pickupLocation: "Lankaran Greenhouse Co.",
    dropoffLocation: "Local Produce Shop, Baku",
    estimatedDistance: "250 km",
    estimatedTime: "3h 40m",
    farmerLocation: "Lənkəran, Seyidəkəran",
    farmerRating: 4.8,
    farmerCompletedOrders: 24,
    farmerSpecialization: "Tomatoes, Cucumbers",
  },
};

function parseAznAmount(value: string): number {
  const match = value.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

function resolveFarmerSlug(farmerName: string): string {
  if (farmerSlugOverrides[farmerName]) {
    return farmerSlugOverrides[farmerName];
  }
  return farmerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildTimelineSteps(order: BuyerOrder): BuyerOrderTimelineStep[] {
  if (order.status === "Cancelled") {
    return buyerOrderTimelineLabels.map((label) => ({
      label,
      status: "cancelled" as const,
    }));
  }

  const baseDate = order.orderDate;
  const stepDates = [
    `${baseDate}, 10:30`,
    order.timelineIndex > 0 ? `${baseDate}, 14:15` : undefined,
    order.timelineIndex > 1 ? `July ${Math.min(16, 10 + order.timelineIndex)}, 2026, 09:00` : undefined,
    order.timelineIndex > 2 ? order.estimatedDelivery ?? "In progress" : undefined,
    order.deliveredDate ? `${order.deliveredDate}, 16:45` : undefined,
  ];

  if (order.status === "Delivered") {
    return buyerOrderTimelineLabels.map((label, index) => ({
      label,
      status: "complete" as const,
      datetime: stepDates[index] ?? `${order.deliveredDate ?? baseDate}`,
    }));
  }

  return buyerOrderTimelineLabels.map((label, index) => {
    if (index < order.timelineIndex) {
      return { label, status: "complete" as const, datetime: stepDates[index] };
    }
    if (index === order.timelineIndex) {
      return { label, status: "current" as const, datetime: stepDates[index] };
    }
    return { label, status: "pending" as const };
  });
}

export function getAllBuyerOrders(userId?: string | null): BuyerOrder[] {
  const placed = userId ? getPlacedOrders(userId) : [];
  return [...placed, ...buyerAllOrders];
}

export function getBuyerOrderByOrderId(orderId: string, userId?: string | null): BuyerOrder | undefined {
  if (userId) {
    const placed = findPlacedOrder(userId, orderId);
    if (placed) return placed;
  }
  return buyerAllOrders.find(
    (order) => order.orderId.toLowerCase() === orderId.toLowerCase(),
  );
}

export function getBuyerOrderDetailHash(orderId: string): string {
  return `dashboard/buyer/orders/${orderId}`;
}

export function getBuyerOrdersListHash(): string {
  return "dashboard/buyer/orders";
}

export function buildBuyerOrderDetail(order: BuyerOrder): BuyerOrderDetail {
  const overrides = orderDetailOverrides[order.orderId] ?? {};
  const subtotalAmount = parseAznAmount(overrides.subtotal ?? order.total);
  const deliveryFeeAmount = parseAznAmount(overrides.deliveryFee ?? "6 AZN");
  const serviceFeeAmount = parseAznAmount(overrides.serviceFee ?? "0 AZN");
  const grandTotalAmount =
    parseAznAmount(overrides.grandTotal ?? "") ||
    subtotalAmount + deliveryFeeAmount + serviceFeeAmount;

  const category = productCategoryMap[order.product] ?? "Produce";
  const farmerSlug = resolveFarmerSlug(order.farmer);

  const paymentStatus =
    overrides.paymentStatus ??
    (order.status === "Delivered"
      ? "Paid"
      : order.status === "Cancelled"
        ? "Refunded"
        : "Pending");

  const paymentMethod =
    overrides.paymentMethod ??
    (order.status === "Delivered" ? "Card on delivery" : "Cash on delivery");

  return {
    ...order,
    category,
    unitPrice: overrides.unitPrice ?? `${(subtotalAmount / 40).toFixed(2)} AZN / unit`,
    subtotal: overrides.subtotal ?? order.total,
    deliveryFee: overrides.deliveryFee ?? `${deliveryFeeAmount} AZN`,
    serviceFee: overrides.serviceFee ?? `${serviceFeeAmount} AZN`,
    grandTotal: overrides.grandTotal ?? `${grandTotalAmount} AZN`,
    paymentMethod,
    paymentStatus,
    harvestDate: overrides.harvestDate ?? order.orderDate,
    batchId: overrides.batchId ?? `AGR-BATCH-${order.orderId.replace("AGR-", "")}`,
    freshnessNote:
      overrides.freshnessNote ?? "Harvested within 24 hours before pickup",
    deliveryAddress: overrides.deliveryAddress ?? `${order.deliveryTo}, Baku`,
    logisticsPartner: overrides.logisticsPartner ?? "Agrivo Delivery Team",
    deliveryContact: overrides.deliveryContact ?? "+994 50 234 56 78",
    deliveryNotes: overrides.deliveryNotes ?? "Please call buyer before arrival.",
    pickupLocation: overrides.pickupLocation ?? order.farmer,
    dropoffLocation: overrides.dropoffLocation ?? `${order.deliveryTo}, Baku`,
    estimatedDistance: overrides.estimatedDistance ?? "220 km",
    estimatedTime: overrides.estimatedTime ?? "3h 20m",
    farmerSlug,
    farmerLocation: overrides.farmerLocation ?? order.route.split("→")[0]?.trim() ?? "Azerbaijan",
    farmerRating: overrides.farmerRating ?? 4.7,
    farmerCompletedOrders: overrides.farmerCompletedOrders ?? 18,
    farmerSpecialization:
      overrides.farmerSpecialization ?? `${order.product}, seasonal produce`,
    farmerVerified: true,
    cancelledAt:
      overrides.cancelledAt ??
      (order.status === "Cancelled" ? order.orderDate : undefined),
    cancelledReason:
      overrides.cancelledReason ??
      (order.status === "Cancelled" ? "Order cancelled by buyer before pickup." : undefined),
    timelineSteps: buildTimelineSteps(order),
  };
}

export function getBuyerOrderDetail(orderId: string, userId?: string | null): BuyerOrderDetail | undefined {
  const order = getBuyerOrderByOrderId(orderId, userId);
  if (!order) return undefined;
  return buildBuyerOrderDetail(order);
}
