import type { BuyerOrder, BuyerOrderStatus } from "../data/buyerDashboard";
import type { DeliveryMethod } from "../data/deliveryTypes";
import type { CartItem } from "./cartStorage";
import { formatQuantity, getCartItemSubtotal } from "./cartStorage";

const PLACED_ORDERS_KEY_PREFIX = "agrivo_buyer_placed_orders_";

export function getPlacedOrders(userId: string): BuyerOrder[] {
  try {
    const raw = localStorage.getItem(`${PLACED_ORDERS_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BuyerOrder[]) : [];
  } catch {
    return [];
  }
}

function setPlacedOrders(userId: string, orders: BuyerOrder[]): void {
  localStorage.setItem(`${PLACED_ORDERS_KEY_PREFIX}${userId}`, JSON.stringify(orders));
}

function generateOrderId(existingIds: Set<string>): string {
  let attempt = 2000 + Math.floor(Math.random() * 8000);
  while (existingIds.has(`AGR-${attempt}`)) {
    attempt += 1;
  }
  return `AGR-${attempt}`;
}

export interface PlaceOrderOptions {
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  address?: string;
  phone?: string;
  note?: string;
}

function cartItemToOrder(
  item: CartItem,
  orderId: string,
  orderDate: Date,
  options: PlaceOrderOptions,
): BuyerOrder {
  const subtotal = getCartItemSubtotal(item);
  const routeParts = item.location.split(">").map((part) => part.trim());
  const route =
    routeParts.length >= 2 ? `${routeParts[0]} → ${routeParts[routeParts.length - 1]}` : item.location;
  const deliveryTo =
    options.deliveryMethod === "self_pickup"
      ? "Farm self pickup"
      : options.address?.trim() || "Buyer delivery address";

  return {
    id: `placed-${orderId}`,
    orderId,
    product: item.name,
    quantity: formatQuantity(item.selectedQuantity, item.unit),
    farmer: item.farmer,
    total: `${(subtotal + options.deliveryFee / Math.max(1, 1)).toFixed(0)} AZN`,
    route,
    deliveryTo,
    status: "Pending" as BuyerOrderStatus,
    orderDate: orderDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    orderDateSort: Number(
      `${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}`,
    ),
    estimatedDelivery: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-US",
      { month: "long", day: "numeric", year: "numeric" },
    ),
    image: item.image,
    timelineIndex: 0,
    deliveryMethod: options.deliveryMethod,
    deliveryFee: options.deliveryFee,
  };
}

export function placeOrdersFromCart(
  userId: string,
  items: CartItem[],
  options: PlaceOrderOptions = {
    deliveryMethod: "agrivo_logistics",
    deliveryFee: 0,
  },
): BuyerOrder[] {
  const existing = getPlacedOrders(userId);
  const existingIds = new Set(existing.map((order) => order.orderId));
  const now = new Date();
  const feeShare = items.length > 0 ? options.deliveryFee / items.length : 0;
  const created = items.map((item) => {
    const orderId = generateOrderId(existingIds);
    existingIds.add(orderId);
    return cartItemToOrder(item, orderId, now, { ...options, deliveryFee: feeShare });
  });
  const next = [...created, ...existing];
  setPlacedOrders(userId, next);
  return created;
}

export function findPlacedOrder(userId: string, orderId: string): BuyerOrder | undefined {
  return getPlacedOrders(userId).find(
    (order) => order.orderId.toLowerCase() === orderId.toLowerCase(),
  );
}

export function updatePlacedOrderStatus(
  userId: string,
  orderId: string,
  status: BuyerOrderStatus,
): BuyerOrder | undefined {
  const existing = getPlacedOrders(userId);
  const index = existing.findIndex((order) => order.orderId.toLowerCase() === orderId.toLowerCase());
  if (index < 0) return undefined;
  const updated = { ...existing[index], status };
  const next = [...existing];
  next[index] = updated;
  setPlacedOrders(userId, next);
  return updated;
}
