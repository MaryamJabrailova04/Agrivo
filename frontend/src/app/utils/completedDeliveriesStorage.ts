import type { AuthUser } from "../auth/authStorage";
import {
  COMPLETED_DELIVERY_SEED,
  RECENT_FEEDBACK_SEED,
  TOP_ROUTES_SEED,
} from "../data/completedDeliveries";

export type CompletionStatus =
  | "completed_on_time"
  | "completed_late"
  | "completed_with_issue";

export type ProofStatus = "photo_signature" | "signature" | "photo" | "none";
export type CompletedDateFilter = "today" | "week" | "month" | "all";
export type CompletedStatusFilter = CompletionStatus | "all";
export type CompletedRatingFilter = "all" | "5" | "4plus" | "below4";

export interface CompletedDelivery {
  id: string;
  taskId: string;
  status: CompletionStatus;
  region: string;
  dateCategory: "today" | "week" | "month";
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
  vehicle: string;
  pickupTime: string;
  completedAt: string;
  deliveryDuration: string;
  distance: string;
  rating: number;
  proofStatus: ProofStatus;
  receivedBy: string;
  feedback: string;
  issue: string | null;
  notes: string | null;
  productKey?: string;
  sortKey?: string;
  pickupLocationLocalized?: { en: string; az: string };
  dropoffLocationLocalized?: { en: string; az: string };
  pickupAddressLocalized?: { en: string; az: string };
  dropoffAddressLocalized?: { en: string; az: string };
  notesLocalized?: { en: string; az: string };
}

export interface CompletedSummary {
  completedToday: number;
  completedThisWeek: number;
  totalDeliveredWeightKg: number;
  onTimeRate: number;
  averageRating: number;
}

export interface PerformanceSummary {
  onTimeRate: number;
  averageDuration: string;
  totalCompleted: number;
  issueRate: number;
}

export interface TopRoute {
  id: string;
  route: string;
  count: number;
}

export interface CompletedFeedback {
  id: string;
  buyerName: string;
  quote: string;
  rating: number;
}

const STORAGE_KEY_PREFIX = "agrivo_completed_deliveries_";

export const COMPLETION_STATUS_LABELS: Record<CompletionStatus, string> = {
  completed_on_time: "Completed on time",
  completed_late: "Completed late",
  completed_with_issue: "Completed with issue",
};

export const COMPLETION_STATUS_SHORT_LABELS: Record<CompletionStatus, string> = {
  completed_on_time: "On time",
  completed_late: "Late",
  completed_with_issue: "With issue",
};

export const PROOF_STATUS_LABELS: Record<ProofStatus, string> = {
  photo_signature: "Photo proof + signature",
  signature: "Signature received",
  photo: "Photo proof",
  none: "No proof",
};

export const COMPLETED_TIMELINE_STEPS = [
  "Assigned",
  "Pickup Scheduled",
  "Collected",
  "In Transit",
  "Near Destination",
  "Delivered",
] as const;

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function seedCompletedDeliveries(): CompletedDelivery[] {
  return COMPLETED_DELIVERY_SEED.map((d) => ({ ...d }));
}

export function resolveCompletedDeliveriesUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_logistics";
}

export function getCompletedDeliveries(userId: string): CompletedDelivery[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const seeded = seedCompletedDeliveries();
      setCompletedDeliveries(userId, seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as CompletedDelivery[];
    return Array.isArray(parsed) ? parsed : seedCompletedDeliveries();
  } catch {
    return seedCompletedDeliveries();
  }
}

export function setCompletedDeliveries(userId: string, deliveries: CompletedDelivery[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(deliveries));
}

export function computeCompletedSummary(deliveries: CompletedDelivery[]): CompletedSummary {
  const today = deliveries.filter((d) => d.dateCategory === "today");
  const week = deliveries.filter((d) => d.dateCategory === "today" || d.dateCategory === "week");
  const onTime = deliveries.filter((d) => d.status === "completed_on_time");
  const totalKg = deliveries.reduce((sum, d) => sum + d.quantity, 0);
  const avgRating =
    deliveries.length === 0
      ? 0
      : Math.round((deliveries.reduce((s, d) => s + d.rating, 0) / deliveries.length) * 10) / 10;

  return {
    completedToday: today.length,
    completedThisWeek: week.length,
    totalDeliveredWeightKg: totalKg,
    onTimeRate:
      deliveries.length === 0 ? 100 : Math.round((onTime.length / deliveries.length) * 100),
    averageRating: avgRating,
  };
}

export function computePerformanceSummary(deliveries: CompletedDelivery[]): PerformanceSummary {
  const onTime = deliveries.filter((d) => d.status === "completed_on_time");
  const withIssue = deliveries.filter((d) => d.status === "completed_with_issue" || d.issue);

  return {
    onTimeRate:
      deliveries.length === 0 ? 100 : Math.round((onTime.length / deliveries.length) * 100),
    averageDuration: "3h 20m",
    totalCompleted: deliveries.length,
    issueRate:
      deliveries.length === 0 ? 0 : Math.round((withIssue.length / deliveries.length) * 100),
  };
}

export function filterCompletedDeliveries(
  deliveries: CompletedDelivery[],
  options: {
    search: string;
    status: CompletedStatusFilter;
    region: string;
    dateFilter: CompletedDateFilter;
    driver: string;
    ratingFilter: CompletedRatingFilter;
  },
): CompletedDelivery[] {
  const query = options.search.trim().toLowerCase();

  return deliveries.filter((d) => {
    const matchesSearch =
      !query ||
      d.taskId.toLowerCase().includes(query) ||
      d.farmerName.toLowerCase().includes(query) ||
      d.buyerName.toLowerCase().includes(query) ||
      d.productName.toLowerCase().includes(query) ||
      d.driverName.toLowerCase().includes(query) ||
      d.variety.toLowerCase().includes(query);

    const matchesStatus = options.status === "all" || d.status === options.status;
    const matchesRegion = options.region === "all" || d.region === options.region;
    const matchesDriver = options.driver === "all" || d.driverName === options.driver;

    const matchesDate =
      options.dateFilter === "all" ||
      (options.dateFilter === "today" && d.dateCategory === "today") ||
      (options.dateFilter === "week" &&
        (d.dateCategory === "today" || d.dateCategory === "week")) ||
      (options.dateFilter === "month");

    const matchesRating =
      options.ratingFilter === "all" ||
      (options.ratingFilter === "5" && d.rating >= 5) ||
      (options.ratingFilter === "4plus" && d.rating >= 4) ||
      (options.ratingFilter === "below4" && d.rating < 4);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRegion &&
      matchesDriver &&
      matchesDate &&
      matchesRating
    );
  });
}

export function getCompletedRegions(deliveries: CompletedDelivery[]): string[] {
  return [...new Set(deliveries.map((d) => d.region))].sort();
}

export function getCompletedDrivers(deliveries: CompletedDelivery[]): string[] {
  return [...new Set(deliveries.map((d) => d.driverName))].sort();
}

export function formatCompletedQuantity(d: CompletedDelivery): string {
  return `${d.quantity} ${d.unit}`;
}

export function truncateText(text: string, maxLength = 36): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function formatRoute(pickup: string, dropoff: string) {
  return { pickup: pickup.trim(), dropoff: dropoff.trim() };
}

export function formatCompletedTime(completedAt: string): string {
  return completedAt.replace(",", "");
}

export function hasDeliveryRating(rating?: number | null): rating is number {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0;
}

export function getRatingDisplay(rating?: number | null): {
  hasRating: boolean;
  value: string;
} {
  if (!hasDeliveryRating(rating)) {
    return { hasRating: false, value: "" };
  }
  return { hasRating: true, value: rating.toFixed(1) };
}

export function formatDeliveredWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tons`;
  return `${kg} kg`;
}

export function seedTopRoutes(): TopRoute[] {
  return TOP_ROUTES_SEED.map((r) => ({ ...r }));
}

export function seedRecentFeedback(): CompletedFeedback[] {
  return RECENT_FEEDBACK_SEED.map((f) => ({ ...f }));
}

export function exportCompletedDeliveriesToCSV(deliveries: CompletedDelivery[]): string {
  const headers = [
    "Delivery ID",
    "Route",
    "Product",
    "Quantity",
    "Driver",
    "Completed At",
    "Duration",
    "Rating",
    "Status",
    "Proof",
  ];
  const rows = deliveries.map((d) => [
    d.taskId,
    `${d.pickupLocation} → ${d.dropoffLocation}`,
    `${d.productName} (${d.variety})`,
    formatCompletedQuantity(d),
    d.driverName,
    d.completedAt,
    d.deliveryDuration,
    String(d.rating),
    COMPLETION_STATUS_LABELS[d.status],
    PROOF_STATUS_LABELS[d.proofStatus],
  ]);
  return [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getLogisticsSectionHash(sectionId: string): string {
  if (sectionId === "overview") return "dashboard/logistics";
  return `dashboard/logistics/${sectionId}`;
}
