import { apiGet, apiPost, apiPut } from "./client";
import type { DeliveryMethod } from "../app/data/deliveryTypes";

export interface ApiDeliverySettings {
  farmerDeliveryEnabled: boolean;
  deliveryFee: number;
  radiusKm: number;
  workingDays: string[];
  deliveryHoursStart: string;
  deliveryHoursEnd: string;
  maxDailyDeliveries: number;
  vehicleType: string;
  logisticsEnabled: boolean;
  logisticsFee: number;
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupHoursStart: string;
  pickupHoursEnd: string;
  pickupPrepMinutes: number;
  sameDayAvailable: boolean;
}

export async function getFarmerDeliverySettingsApi(): Promise<ApiDeliverySettings> {
  const res = await apiGet<{ success: boolean; settings: ApiDeliverySettings }>(
    "/farmer/delivery-settings",
  );
  return res.settings;
}

export async function updateFarmerDeliverySettingsApi(
  settings: Partial<ApiDeliverySettings>,
): Promise<ApiDeliverySettings> {
  const res = await apiPut<{ success: boolean; settings: ApiDeliverySettings }>(
    "/farmer/delivery-settings",
    settings,
  );
  return res.settings;
}

export async function getProductDeliveryOptionsApi(productId: string) {
  const res = await apiGet<{ success: boolean; options: Record<string, unknown> }>(
    `/products/${productId}/delivery-options`,
  );
  return res.options;
}

export async function getOrderTrackingApi(orderId: string) {
  const res = await apiGet<{ success: boolean; tracking: Record<string, unknown> }>(
    `/orders/${orderId}/tracking`,
  );
  return res.tracking;
}

export async function rateOrderDeliveryApi(orderId: string, rating: number, feedback?: string) {
  const res = await apiPost<{ success: boolean; delivery: unknown }>(
    `/orders/${orderId}/rate-delivery`,
    { rating, feedback },
  );
  return res.delivery;
}

export type { DeliveryMethod };
