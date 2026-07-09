import type { TranslateFn } from "./LanguageContext";

const STATUS_KEY_MAP: Record<string, string> = {
  active: "status.active",
  pending: "status.pending",
  confirmed: "status.confirmed",
  preparing: "status.preparing",
  "in transit": "status.inTransit",
  delivered: "status.delivered",
  completed: "status.delivered",
  cancelled: "status.cancelled",
  canceled: "status.cancelled",
  "low stock": "status.lowStock",
  "out of stock": "status.outOfStock",
  open: "status.open",
  "offers received": "status.offersReceived",
  accepted: "status.accepted",
  ready: "status.ready",
  assigned: "status.assigned",
  delayed: "status.delayed",
  "pickup scheduled": "status.confirmed",
};

export function translateStatus(t: TranslateFn, status: string): string {
  const key = STATUS_KEY_MAP[status.toLowerCase().trim()];
  return key ? t(key, status) : status;
}
