export type DeliveryMethod = "farmer_delivery" | "agrivo_logistics" | "self_pickup";

export type FarmerVehicleType = "motorcycle" | "car" | "pickup" | "truck";

export type DeliveryTrackingStepId =
  | "order_confirmed"
  | "preparing"
  | "courier_assigned"
  | "picked_up"
  | "on_the_way"
  | "ready_for_pickup"
  | "delivered";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface FarmerDeliverySettings {
  farmerSlug: string;
  farmerDeliveryEnabled: boolean;
  deliveryFee: number;
  radiusKm: number;
  workingDays: Weekday[];
  deliveryHoursStart: string;
  deliveryHoursEnd: string;
  maxDailyDeliveries: number;
  vehicleType: FarmerVehicleType;
  logisticsEnabled: boolean;
  logisticsFee: number;
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupHoursStart: string;
  pickupHoursEnd: string;
  pickupPrepMinutes: number;
  sameDayAvailable: boolean;
  updatedAt: string;
}

export interface ProductDeliveryCapability {
  productId: string;
  productSlug: string;
  farmerSlug: string | null;
  farmerDelivery: boolean;
  agrivoLogistics: boolean;
  selfPickup: boolean;
  farmerFee?: number;
  logisticsFee?: number;
  freeDelivery?: boolean;
  fastDelivery?: boolean;
}

export interface DeliveryMethodQuote {
  method: DeliveryMethod;
  enabled: boolean;
  fee: number;
  estimatedTimeLabel: string;
  shortDescription: string;
  meta?: {
    radiusKm?: number;
    workingDays?: Weekday[];
    hoursLabel?: string;
    prepMinutes?: number;
    vehicleType?: FarmerVehicleType;
    logisticsCompany?: string;
  };
}

export interface TrackingEvent {
  id: string;
  stepId: DeliveryTrackingStepId;
  labelKey: string;
  at: string;
  complete: boolean;
  current: boolean;
}

export interface DeliveryTrackingRecord {
  orderId: string;
  method: DeliveryMethod;
  status: DeliveryTrackingStepId;
  deliveryFee: number;
  pickupCode?: string;
  etaLabel?: string;
  courierName?: string;
  vehicleLabel?: string;
  currentLocation?: string;
  farmAddress?: string;
  pickupHours?: string;
  events: TrackingEvent[];
  cancellable: boolean;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DEFAULT_WORKING_DAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const LOGISTICS_TIMELINE: DeliveryTrackingStepId[] = [
  "order_confirmed",
  "preparing",
  "courier_assigned",
  "picked_up",
  "on_the_way",
  "delivered",
];

export const FARMER_TIMELINE: DeliveryTrackingStepId[] = [
  "order_confirmed",
  "preparing",
  "picked_up",
  "on_the_way",
  "delivered",
];

export const PICKUP_TIMELINE: DeliveryTrackingStepId[] = [
  "order_confirmed",
  "preparing",
  "ready_for_pickup",
  "delivered",
];

export function timelineForMethod(method: DeliveryMethod): DeliveryTrackingStepId[] {
  if (method === "self_pickup") return PICKUP_TIMELINE;
  if (method === "farmer_delivery") return FARMER_TIMELINE;
  return LOGISTICS_TIMELINE;
}

export function generatePickupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
