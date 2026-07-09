import type { AuthUser } from "../auth/authStorage";
import {
  IN_TRANSIT_DELIVERY_SEED,
  TRANSIT_DRIVER_SEED,
  TRANSIT_ETA_ALERT_SEED,
  TRANSIT_ISSUE_SEED,
} from "../data/inTransitDeliveries";

export type InTransitStatus =
  | "in_transit"
  | "near_destination"
  | "delayed"
  | "issue_reported"
  | "delivered";

export type EtaStatus = "on_time" | "delay_risk" | "delayed";
export type InTransitStatusFilter = InTransitStatus | "all";
export type EtaStatusFilter = "all" | "arriving_soon" | "on_time" | "delayed";
export type InTransitPriority = "high" | "medium" | "low";

export interface InTransitDelivery {
  id: string;
  taskId: string;
  status: InTransitStatus;
  etaStatus: EtaStatus;
  region: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupAddress: string;
  dropoffAddress: string;
  farmerName: string;
  buyerName: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  driverName: string;
  driverPhone: string;
  vehicle: string;
  currentLocation: string;
  eta: string;
  distanceRemaining: string;
  progress: number;
  priority: InTransitPriority;
  issue: string | null;
  notes: string;
  productKey?: string;
  sortKey?: string;
  pickupLocationLocalized?: { en: string; az: string };
  dropoffLocationLocalized?: { en: string; az: string };
  currentLocationLocalized?: { en: string; az: string };
  pickupAddressLocalized?: { en: string; az: string };
  dropoffAddressLocalized?: { en: string; az: string };
  notesLocalized?: { en: string; az: string };
}

export interface InTransitSummary {
  activeTrips: number;
  onTime: number;
  delayed: number;
  nearDestination: number;
  issuesReported: number;
}

export interface RouteProgressSummary {
  averageCompletion: number;
  totalRemainingDistance: number;
  onTimeRate: number;
  activeRoutes: number;
}

export interface TransitDriver {
  id: string;
  name: string;
  vehicle: string;
  status: string;
  routeLabel: string;
  statusTone: "active" | "near" | "delayed" | "issue";
}

export interface TransitEtaAlert {
  id: string;
  type: "delay_risk" | "near_destination" | "traffic" | "buyer_waiting" | "temperature";
  title: string;
  description: string;
  urgency: "high" | "medium";
  taskId: string;
}

export interface InTransitIssue {
  id: string;
  taskId: string;
  type: "traffic_delay" | "vehicle_problem" | "address_changed" | "driver_unreachable";
  label: string;
  status: "open" | "resolved";
}

export type InTransitAction =
  | "mark_delivered"
  | "resolve_issue"
  | "confirm_arrival"
  | "view_details"
  | "open_route"
  | "contact_driver"
  | "report_issue"
  | "notify_buyer";

const STORAGE_KEY_PREFIX = "agrivo_in_transit_";

export const IN_TRANSIT_STATUS_LABELS: Record<InTransitStatus, string> = {
  in_transit: "In Transit",
  near_destination: "Near Destination",
  delayed: "Delayed",
  issue_reported: "Issue Reported",
  delivered: "Delivered",
};

export const IN_TRANSIT_TIMELINE_STEPS = [
  "Assigned",
  "Pickup Scheduled",
  "Collected",
  "In Transit",
  "Near Destination",
  "Delivered",
] as const;

const ACTION_NEXT_STATUS: Partial<Record<InTransitAction, InTransitStatus>> = {
  mark_delivered: "delivered",
  resolve_issue: "in_transit",
  confirm_arrival: "near_destination",
  report_issue: "issue_reported",
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function seedInTransitDeliveries(): InTransitDelivery[] {
  return IN_TRANSIT_DELIVERY_SEED.map((d) => ({ ...d }));
}

export function resolveInTransitUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_logistics";
}

export function getInTransitDeliveries(userId: string): InTransitDelivery[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const seeded = seedInTransitDeliveries();
      setInTransitDeliveries(userId, seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as InTransitDelivery[];
    return Array.isArray(parsed) ? parsed : seedInTransitDeliveries();
  } catch {
    return seedInTransitDeliveries();
  }
}

export function setInTransitDeliveries(userId: string, deliveries: InTransitDelivery[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(deliveries));
}

export function applyInTransitAction(
  userId: string,
  deliveryId: string,
  action: InTransitAction,
): InTransitDelivery[] {
  const nextStatus = ACTION_NEXT_STATUS[action];
  if (!nextStatus) return getInTransitDeliveries(userId);

  const tasks = getInTransitDeliveries(userId);
  const next = tasks.map((task) => {
    if (task.id !== deliveryId) return task;
    const updated: InTransitDelivery = { ...task, status: nextStatus };
    if (action === "resolve_issue") {
      updated.issue = null;
      updated.etaStatus = "on_time";
    }
    if (action === "report_issue") {
      updated.issue = updated.issue ?? "Issue reported by logistics team";
    }
    if (action === "confirm_arrival") {
      updated.progress = Math.min(99, updated.progress + 2);
    }
    return updated;
  });

  setInTransitDeliveries(userId, next);
  return next;
}

export function computeInTransitSummary(deliveries: InTransitDelivery[]): InTransitSummary {
  const active = deliveries.filter((d) => d.status !== "delivered");
  return {
    activeTrips: active.length,
    onTime: active.filter((d) => d.etaStatus === "on_time").length,
    delayed: active.filter((d) => d.status === "delayed" || d.etaStatus === "delayed").length,
    nearDestination: active.filter((d) => d.status === "near_destination").length,
    issuesReported: active.filter(
      (d) => d.status === "issue_reported" || Boolean(d.issue),
    ).length,
  };
}

export function computeRouteProgressSummary(deliveries: InTransitDelivery[]): RouteProgressSummary {
  const active = deliveries.filter((d) => d.status !== "delivered");
  const avg =
    active.length === 0
      ? 0
      : Math.round(active.reduce((sum, d) => sum + d.progress, 0) / active.length);

  const totalKm = active.reduce((sum, d) => {
    const km = Number.parseInt(d.distanceRemaining, 10);
    return sum + (Number.isNaN(km) ? 0 : km);
  }, 0);

  const onTimeCount = active.filter((d) => d.etaStatus === "on_time").length;
  const onTimeRate = active.length === 0 ? 100 : Math.round((onTimeCount / active.length) * 100);

  return {
    averageCompletion: avg,
    totalRemainingDistance: totalKm,
    onTimeRate,
    activeRoutes: active.length,
  };
}

export function filterInTransitDeliveries(
  deliveries: InTransitDelivery[],
  options: {
    search: string;
    status: InTransitStatusFilter;
    region: string;
    etaFilter: EtaStatusFilter;
    driver: string;
  },
): InTransitDelivery[] {
  const query = options.search.trim().toLowerCase();

  return deliveries.filter((d) => {
    const matchesSearch =
      !query ||
      d.taskId.toLowerCase().includes(query) ||
      d.driverName.toLowerCase().includes(query) ||
      d.vehicle.toLowerCase().includes(query) ||
      d.buyerName.toLowerCase().includes(query) ||
      d.productName.toLowerCase().includes(query);

    const matchesStatus = options.status === "all" || d.status === options.status;
    const matchesRegion = options.region === "all" || d.region === options.region;
    const matchesDriver = options.driver === "all" || d.driverName === options.driver;

    const matchesEta =
      options.etaFilter === "all" ||
      (options.etaFilter === "on_time" && d.etaStatus === "on_time") ||
      (options.etaFilter === "delayed" &&
        (d.etaStatus === "delayed" || d.etaStatus === "delay_risk")) ||
      (options.etaFilter === "arriving_soon" && d.status === "near_destination");

    return matchesSearch && matchesStatus && matchesRegion && matchesDriver && matchesEta;
  });
}

export function getInTransitRegions(deliveries: InTransitDelivery[]): string[] {
  return [...new Set(deliveries.map((d) => d.region))].sort();
}

export function getInTransitDrivers(deliveries: InTransitDelivery[]): string[] {
  return [...new Set(deliveries.map((d) => d.driverName))].sort();
}

export function formatTransitQuantity(d: InTransitDelivery): string {
  return `${d.quantity} ${d.unit}`;
}

export function getPrimaryTransitAction(status: InTransitStatus): InTransitAction | null {
  switch (status) {
    case "in_transit":
      return "mark_delivered";
    case "near_destination":
      return "confirm_arrival";
    case "delayed":
    case "issue_reported":
      return "resolve_issue";
    default:
      return null;
  }
}

export function getSecondaryTransitActions(status: InTransitStatus): InTransitAction[] {
  switch (status) {
    case "in_transit":
      return ["view_details", "open_route", "contact_driver", "report_issue"];
    case "near_destination":
      return ["view_details", "open_route", "contact_driver"];
    case "delayed":
      return ["view_details", "open_route", "contact_driver", "notify_buyer"];
    case "issue_reported":
      return ["view_details", "open_route", "contact_driver", "notify_buyer"];
    default:
      return ["view_details"];
  }
}

export function getTransitActionLabel(action: InTransitAction): string {
  const labels: Record<InTransitAction, string> = {
    mark_delivered: "Mark Delivered",
    resolve_issue: "Resolve Issue",
    confirm_arrival: "Confirm Arrival",
    view_details: "View Details",
    open_route: "Open Route",
    contact_driver: "Contact Driver",
    report_issue: "Report Issue",
    notify_buyer: "Notify Buyer",
  };
  return labels[action];
}

export function getTimelineStepIndex(status: InTransitStatus): number {
  switch (status) {
    case "in_transit":
      return 3;
    case "near_destination":
      return 4;
    case "delayed":
    case "issue_reported":
      return 3;
    case "delivered":
      return 5;
    default:
      return 3;
  }
}

export function seedTransitDrivers(): TransitDriver[] {
  return TRANSIT_DRIVER_SEED.map((d) => ({ ...d }));
}

export function seedTransitEtaAlerts(): TransitEtaAlert[] {
  return TRANSIT_ETA_ALERT_SEED.map((a) => ({ ...a }));
}

export function seedTransitIssues(): InTransitIssue[] {
  return TRANSIT_ISSUE_SEED.map((i) => ({ ...i }));
}

export function getLogisticsSectionHash(sectionId: string): string {
  if (sectionId === "overview") return "dashboard/logistics";
  return `dashboard/logistics/${sectionId}`;
}
