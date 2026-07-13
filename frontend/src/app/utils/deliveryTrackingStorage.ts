import {
  generatePickupCode,
  timelineForMethod,
  type DeliveryMethod,
  type DeliveryTrackingRecord,
  type DeliveryTrackingStepId,
  type TrackingEvent,
} from "../data/deliveryTypes";
import { getFarmerDeliverySettings } from "./farmerDeliverySettingsStorage";

const STORAGE_KEY = "agrivo_delivery_tracking";
export const DELIVERY_TRACKING_CHANGED = "agrivo-delivery-tracking-changed";

function notify(): void {
  window.dispatchEvent(new Event(DELIVERY_TRACKING_CHANGED));
}

function readAll(): Record<string, DeliveryTrackingRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, DeliveryTrackingRecord>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  notify();
}

function stepLabelKey(stepId: DeliveryTrackingStepId): string {
  return `delivery.timeline.${stepId}`;
}

function buildEvents(
  method: DeliveryMethod,
  currentStep: DeliveryTrackingStepId,
  createdAt: string,
): TrackingEvent[] {
  const steps = timelineForMethod(method);
  const currentIndex = Math.max(0, steps.indexOf(currentStep));
  return steps.map((stepId, index) => ({
    id: `${stepId}-${index}`,
    stepId,
    labelKey: stepLabelKey(stepId),
    at: createdAt,
    complete: index < currentIndex,
    current: index === currentIndex,
  }));
}

export function createDeliveryTracking(input: {
  orderId: string;
  method: DeliveryMethod;
  deliveryFee: number;
  farmerSlug?: string | null;
  etaLabel?: string;
}): DeliveryTrackingRecord {
  const now = new Date().toISOString();
  const settings = getFarmerDeliverySettings(input.farmerSlug);
  const initialStatus: DeliveryTrackingStepId = "order_confirmed";
  const record: DeliveryTrackingRecord = {
    orderId: input.orderId,
    method: input.method,
    status: initialStatus,
    deliveryFee: input.deliveryFee,
    pickupCode: input.method === "self_pickup" ? generatePickupCode() : undefined,
    etaLabel: input.etaLabel,
    courierName: input.method === "agrivo_logistics" ? "Rashad Aliyev" : undefined,
    vehicleLabel:
      input.method === "agrivo_logistics"
        ? "Refrigerated van · 10-AB-234"
        : input.method === "farmer_delivery"
          ? settings.vehicleType
          : undefined,
    currentLocation: input.method === "self_pickup" ? settings.pickupAddress : undefined,
    farmAddress: settings.pickupAddress,
    pickupHours: `${settings.pickupHoursStart} - ${settings.pickupHoursEnd}`,
    events: buildEvents(input.method, initialStatus, now),
    cancellable: true,
    createdAt: now,
    updatedAt: now,
  };

  const all = readAll();
  all[input.orderId] = record;
  writeAll(all);
  return record;
}

export function getDeliveryTracking(orderId: string): DeliveryTrackingRecord | undefined {
  return readAll()[orderId];
}

export function listDeliveryTracking(): DeliveryTrackingRecord[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function advanceDeliveryTracking(
  orderId: string,
  nextStatus?: DeliveryTrackingStepId,
): DeliveryTrackingRecord | undefined {
  const all = readAll();
  const current = all[orderId];
  if (!current) return undefined;

  const steps = timelineForMethod(current.method);
  const index = steps.indexOf(current.status);
  const resolved =
    nextStatus ??
    (index >= 0 && index < steps.length - 1 ? steps[index + 1] : current.status);

  const now = new Date().toISOString();
  const updated: DeliveryTrackingRecord = {
    ...current,
    status: resolved,
    events: buildEvents(current.method, resolved, now),
    cancellable: resolved === "order_confirmed" || resolved === "preparing",
    updatedAt: now,
  };

  all[orderId] = updated;
  writeAll(all);
  return updated;
}

export function cancelDeliveryTracking(orderId: string): DeliveryTrackingRecord | undefined {
  const all = readAll();
  const current = all[orderId];
  if (!current || !current.cancellable) return undefined;

  const now = new Date().toISOString();
  const updated: DeliveryTrackingRecord = {
    ...current,
    status: "order_confirmed",
    cancellable: false,
    events: current.events.map((event, index) => ({
      ...event,
      complete: index === 0,
      current: false,
      at: now,
    })),
    feedback: "cancelled",
    updatedAt: now,
  };
  all[orderId] = updated;
  writeAll(all);
  return updated;
}

export function rateDeliveryTracking(
  orderId: string,
  rating: number,
  feedback?: string,
): DeliveryTrackingRecord | undefined {
  const all = readAll();
  const current = all[orderId];
  if (!current) return undefined;
  const updated = {
    ...current,
    rating,
    feedback,
    updatedAt: new Date().toISOString(),
  };
  all[orderId] = updated;
  writeAll(all);
  return updated;
}
