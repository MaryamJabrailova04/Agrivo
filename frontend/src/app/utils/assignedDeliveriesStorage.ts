import type { AuthUser } from "../auth/authStorage";
import { ASSIGNED_DELIVERY_SEED } from "../data/assignedDeliveries";

export type AssignedDeliveryStatus =
  | "assigned"
  | "pickup_scheduled"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "cancelled";

export type AssignedDeliveryPriority = "high" | "medium" | "low";
export type AssignedStatusFilter = AssignedDeliveryStatus | "all";
export type AssignedPriorityFilter = AssignedDeliveryPriority | "all";
export type AssignedDateFilter = "today" | "tomorrow" | "week" | "all";

export interface AssignedDelivery {
  id: string;
  taskId: string;
  status: AssignedDeliveryStatus;
  priority: AssignedDeliveryPriority;
  assignedAt: string;
  dateCategory: "today" | "tomorrow" | "week";
  pickupLocation: string;
  dropoffLocation: string;
  pickupAddress: string;
  dropoffAddress: string;
  farmerName: string;
  farmerPhone: string;
  buyerName: string;
  buyerPhone: string;
  buyerType: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  pickupTime: string;
  eta: string;
  driverName: string;
  vehicle: string;
  region: string;
  notes: string;
  productKey?: string;
  sortKey?: string;
  buyerTypeKey?: string;
  pickupLocationLocalized?: { en: string; az: string };
  dropoffLocationLocalized?: { en: string; az: string };
  pickupAddressLocalized?: { en: string; az: string };
  dropoffAddressLocalized?: { en: string; az: string };
  notesLocalized?: { en: string; az: string };
}

export interface AssignedDeliverySummary {
  totalAssigned: number;
  pendingPickup: number;
  inProgress: number;
  highPriority: number;
}

export type AssignedDeliveryAction =
  | "start_pickup"
  | "mark_picked_up"
  | "start_transit"
  | "mark_delivered"
  | "mark_resolved"
  | "view_details"
  | "open_route"
  | "contact";

const STORAGE_KEY_PREFIX = "agrivo_assigned_deliveries_";

export const ASSIGNED_STATUS_LABELS: Record<AssignedDeliveryStatus, string> = {
  assigned: "Assigned",
  pickup_scheduled: "Pickup Scheduled",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export const ASSIGNED_PRIORITY_LABELS: Record<AssignedDeliveryPriority, string> = {
  high: "High priority",
  medium: "Medium",
  low: "Low",
};

export const ASSIGNED_PRIORITY_OPTIONS: AssignedDeliveryPriority[] = ["high", "medium", "low"];

export const TIMELINE_STEPS: AssignedDeliveryStatus[] = [
  "assigned",
  "pickup_scheduled",
  "picked_up",
  "in_transit",
  "delivered",
];

const ACTION_NEXT_STATUS: Partial<Record<AssignedDeliveryAction, AssignedDeliveryStatus>> = {
  start_pickup: "pickup_scheduled",
  mark_picked_up: "picked_up",
  start_transit: "in_transit",
  mark_delivered: "delivered",
  mark_resolved: "in_transit",
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function seedAssignedDeliveries(): AssignedDelivery[] {
  return ASSIGNED_DELIVERY_SEED.map((delivery) => ({ ...delivery }));
}

export function resolveAssignedDeliveriesUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_logistics";
}

export function getAssignedDeliveries(userId: string): AssignedDelivery[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const seeded = seedAssignedDeliveries();
      setAssignedDeliveries(userId, seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as AssignedDelivery[];
    return Array.isArray(parsed) ? parsed : seedAssignedDeliveries();
  } catch {
    return seedAssignedDeliveries();
  }
}

export function setAssignedDeliveries(userId: string, deliveries: AssignedDelivery[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(deliveries));
}

export function updateAssignedDeliveryStatus(
  userId: string,
  deliveryId: string,
  status: AssignedDeliveryStatus,
): AssignedDelivery[] {
  const deliveries = getAssignedDeliveries(userId);
  const next = deliveries.map((delivery) =>
    delivery.id === deliveryId ? { ...delivery, status } : delivery,
  );
  setAssignedDeliveries(userId, next);
  return next;
}

export function applyAssignedDeliveryAction(
  userId: string,
  deliveryId: string,
  action: AssignedDeliveryAction,
): AssignedDelivery[] {
  const nextStatus = ACTION_NEXT_STATUS[action];
  if (!nextStatus) return getAssignedDeliveries(userId);
  return updateAssignedDeliveryStatus(userId, deliveryId, nextStatus);
}

export function computeAssignedDeliverySummary(
  deliveries: AssignedDelivery[],
): AssignedDeliverySummary {
  const active = deliveries.filter(
    (delivery) => delivery.status !== "delivered" && delivery.status !== "cancelled",
  );

  return {
    totalAssigned: active.length,
    pendingPickup: deliveries.filter(
      (delivery) => delivery.status === "assigned" || delivery.status === "pickup_scheduled",
    ).length,
    inProgress: deliveries.filter(
      (delivery) =>
        delivery.status === "picked_up" ||
        delivery.status === "in_transit" ||
        delivery.status === "delayed",
    ).length,
    highPriority: deliveries.filter(
      (delivery) =>
        delivery.priority === "high" &&
        delivery.status !== "delivered" &&
        delivery.status !== "cancelled",
    ).length,
  };
}

export function filterAssignedDeliveries(
  deliveries: AssignedDelivery[],
  options: {
    search: string;
    status: AssignedStatusFilter;
    region: string;
    dateFilter: AssignedDateFilter;
    priority: AssignedPriorityFilter;
  },
): AssignedDelivery[] {
  const query = options.search.trim().toLowerCase();

  return deliveries.filter((delivery) => {
    const matchesSearch =
      !query ||
      delivery.taskId.toLowerCase().includes(query) ||
      delivery.pickupLocation.toLowerCase().includes(query) ||
      delivery.dropoffLocation.toLowerCase().includes(query) ||
      delivery.productName.toLowerCase().includes(query) ||
      delivery.farmerName.toLowerCase().includes(query) ||
      delivery.buyerName.toLowerCase().includes(query) ||
      delivery.variety.toLowerCase().includes(query);

    const matchesStatus = options.status === "all" || delivery.status === options.status;
    const matchesRegion = options.region === "all" || delivery.region === options.region;
    const matchesPriority = options.priority === "all" || delivery.priority === options.priority;
    const matchesDate =
      options.dateFilter === "all" || delivery.dateCategory === options.dateFilter;

    return matchesSearch && matchesStatus && matchesRegion && matchesPriority && matchesDate;
  });
}

export function getAssignedDeliveryRegions(deliveries: AssignedDelivery[]): string[] {
  return [...new Set(deliveries.map((delivery) => delivery.region))].sort();
}

export function formatAssignedQuantity(delivery: AssignedDelivery): string {
  return `${delivery.quantity} ${delivery.unit}`;
}

export function getAvailableActions(status: AssignedDeliveryStatus): AssignedDeliveryAction[] {
  const primary = getPrimaryAction(status);
  const secondary = getSecondaryActions(status);
  return primary ? [primary, ...secondary] : secondary;
}

export const PRIMARY_DELIVERY_ACTIONS: AssignedDeliveryAction[] = [
  "start_pickup",
  "mark_picked_up",
  "start_transit",
  "mark_delivered",
  "mark_resolved",
];

export function isPrimaryDeliveryAction(action: AssignedDeliveryAction): boolean {
  return PRIMARY_DELIVERY_ACTIONS.includes(action);
}

export function getPrimaryAction(status: AssignedDeliveryStatus): AssignedDeliveryAction | null {
  switch (status) {
    case "assigned":
      return "start_pickup";
    case "pickup_scheduled":
      return "mark_picked_up";
    case "picked_up":
      return "start_transit";
    case "in_transit":
      return "mark_delivered";
    case "delayed":
      return "mark_resolved";
    default:
      return null;
  }
}

export function getSecondaryActions(status: AssignedDeliveryStatus): AssignedDeliveryAction[] {
  switch (status) {
    case "assigned":
    case "pickup_scheduled":
    case "picked_up":
    case "in_transit":
      return ["view_details", "open_route", "contact"];
    case "delivered":
      return ["view_details", "open_route", "contact"];
    case "delayed":
      return ["view_details", "open_route", "contact"];
    case "cancelled":
      return ["view_details"];
    default:
      return ["view_details"];
  }
}

export function getActionLabel(action: AssignedDeliveryAction): string {
  switch (action) {
    case "start_pickup":
      return "Start Pickup";
    case "mark_picked_up":
      return "Mark Picked Up";
    case "start_transit":
      return "Start Transit";
    case "mark_delivered":
      return "Mark Delivered";
    case "mark_resolved":
      return "Mark Resolved";
    case "view_details":
      return "View Details";
    case "open_route":
      return "Open Route";
    case "contact":
      return "Contact";
    default:
      return "Action";
  }
}

export function getTimelineStepIndex(status: AssignedDeliveryStatus): number {
  if (status === "delayed") return TIMELINE_STEPS.indexOf("in_transit");
  if (status === "cancelled") return -1;
  const index = TIMELINE_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

export function getLogisticsSectionHash(sectionId: string): string {
  if (sectionId === "overview") return "dashboard/logistics";
  return `dashboard/logistics/${sectionId}`;
}
