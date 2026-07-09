import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import { getLocalizedProductName } from "./farmerProductHelpers";
import type {
  DeliveryPriority,
  DeliveryTaskStatus,
  UrgentAlert,
} from "../app/utils/logisticsDashboardStorage";

const LOCATION_KEYS: Record<string, string> = {
  lankaranfarm: "locations.lankaranFarm",
  lankarangreenhouse: "locations.lankaranGreenhouse",
  bakumarket: "locations.bakuMarket",
  qubafarm: "locations.qubaFarm",
  ganjafields: "locations.ganjaFields",
  ganjahub: "locations.ganjaHub",
  shekiorchard: "locations.shekiOrchard",
  greenmarketbaku: "locations.greenMarketBaku",
  freshbazaarsumqayit: "locations.freshBazaarSumqayit",
  absheronfarm: "locations.absheronFarm",
  citygrocerychain: "locations.cityGroceryChain",
  masallipickuppoint: "locations.masalliPickupPoint",
};

const STOP_LABEL_KEYS: Record<string, string> = {
  pickup1: "routeStops.pickup1",
  pickup2: "routeStops.pickup2",
  "drop-off": "routeStops.dropoff",
  dropoff: "routeStops.dropoff",
};

const REGION_KEYS: Record<string, string> = {
  lankaran: "regions.lankaran",
  quba: "regions.quba",
  ganja: "regions.ganja",
  baku: "regions.baku",
  sheki: "regions.sheki",
  azerbaijan: "regions.azerbaijan",
};

const ALERT_KEYS: Record<string, { title: string; description: string }> = {
  "alert-1": {
    title: "alerts.delayedPickup.title",
    description: "alerts.delayedPickup.description",
  },
  "alert-2": {
    title: "alerts.routeChanged.title",
    description: "alerts.routeChanged.description",
  },
  "alert-3": {
    title: "alerts.buyerConfirmation.title",
    description: "alerts.buyerConfirmation.description",
  },
  "alert-4": {
    title: "alerts.deadline.title",
    description: "alerts.deadline.description",
  },
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function translateLogisticsStatus(t: TranslateFn, status: DeliveryTaskStatus): string {
  const keyMap: Record<DeliveryTaskStatus, string> = {
    assigned: "logisticsDashboard.status.assigned",
    pickup_scheduled: "logisticsDashboard.status.pickupPending",
    picked_up: "logisticsDashboard.status.pickedUp",
    in_transit: "logisticsDashboard.status.inTransit",
    delivered: "logisticsDashboard.status.delivered",
    delayed: "logisticsDashboard.status.delayed",
  };
  return t(keyMap[status], status);
}

export function translateLogisticsPriority(t: TranslateFn, priority: DeliveryPriority): string {
  const keyMap: Record<DeliveryPriority, string> = {
    low: "logisticsDashboard.priority.low",
    normal: "logisticsDashboard.priority.normal",
    high: "logisticsDashboard.priority.high",
  };
  return t(keyMap[priority], priority);
}

export function translateLogisticsLocation(t: TranslateFn, location: string): string {
  const key = LOCATION_KEYS[normalizeKey(location)];
  return key ? t(`logisticsDashboard.${key}`, location) : location;
}

export function translateLogisticsRegion(t: TranslateFn, region: string): string {
  const key = REGION_KEYS[normalizeKey(region)];
  return key ? t(`logisticsDashboard.${key}`, region) : region;
}

export function translateLogisticsStopLabel(t: TranslateFn, label: string): string {
  const key = STOP_LABEL_KEYS[normalizeKey(label)];
  return key ? t(`logisticsDashboard.${key}`, label) : label;
}

export function translateLogisticsRouteTitle(t: TranslateFn, title: string): string {
  if (title.includes("→")) {
    const [from, to] = title.split("→").map((part) => part.trim());
    return `${translateLogisticsLocation(t, from)} → ${translateLogisticsLocation(t, to)}`;
  }
  return translateLogisticsLocation(t, title);
}

export function translateLogisticsProduct(
  t: TranslateFn,
  language: Language,
  productName: string,
): string {
  return getLocalizedProductName({ name: productName }, language, t);
}

export function translateUrgentAlert(
  t: TranslateFn,
  alert: UrgentAlert,
): { title: string; description: string } {
  const keys = ALERT_KEYS[alert.id];
  if (keys) {
    return {
      title: t(`logisticsDashboard.${keys.title}`),
      description: t(`logisticsDashboard.${keys.description}`),
    };
  }
  return { title: alert.title, description: alert.description };
}

export function formatLogisticsTaskCount(t: TranslateFn, count: number): string {
  if (count === 1) return t("logisticsDashboard.tasks.oneTask");
  return t("logisticsDashboard.tasks.taskCount", { count });
}

export function formatLogisticsEta(t: TranslateFn, eta: string): string {
  return t("logisticsDashboard.route.eta", { time: eta });
}

export function formatLogisticsRouteLabel(
  t: TranslateFn,
  pickup: string,
  dropoff: string,
): string {
  return `${translateLogisticsLocation(t, pickup)} → ${translateLogisticsLocation(t, dropoff)}`;
}
