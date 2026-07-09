import { apiGet, apiPatch, apiPost } from "./client";

export type ApiOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface ApiOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  nameKey?: string;
  nameLocalized?: { en: string; az: string };
  variety: string | null;
  varietyKey?: string;
  varietyLocalized?: { en: string; az: string };
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface ApiOrder {
  id: string;
  buyerId: string;
  farmerId: string;
  status: ApiOrderStatus;
  totalAmount: number;
  deliveryMethod: string | null;
  deliveryAddress: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
}

interface OrdersResponse {
  success: boolean;
  count: number;
  orders: ApiOrder[];
}

interface OrderResponse {
  success: boolean;
  order: ApiOrder;
}

export async function getOrders(): Promise<ApiOrder[]> {
  const res = await apiGet<OrdersResponse>("/orders");
  return res.orders;
}

export async function getOrderById(id: string): Promise<ApiOrder> {
  const res = await apiGet<OrderResponse>(`/orders/${id}`);
  return res.order;
}

export async function createOrder(payload: {
  farmerId: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  items: { productId: string; quantity: number }[];
}): Promise<ApiOrder> {
  const res = await apiPost<OrderResponse>("/orders", payload);
  return res.order;
}

export async function updateOrderStatus(id: string, status: ApiOrderStatus): Promise<ApiOrder> {
  const res = await apiPatch<OrderResponse>(`/orders/${id}/status`, { status });
  return res.order;
}
