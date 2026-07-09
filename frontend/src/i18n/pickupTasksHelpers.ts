import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import {
  getLocalizedProductName,
  resolveLocalizedVariety,
} from "./farmerProductHelpers";
import {
  translateLogisticsLocation,
  translateLogisticsRegion,
} from "./logisticsDashboardHelpers";
import type {
  PickupAlert,
  PickupPriority,
  PickupReadiness,
  PickupTask,
  PickupTaskAction,
  PickupTaskStatus,
  PickupTimeFilter,
} from "../app/utils/pickupTasksStorage";

const STATUS_KEYS: Record<PickupTaskStatus, string> = {
  scheduled: "pickupTasks.status.scheduled",
  ready_for_pickup: "pickupTasks.status.readyForPickup",
  driver_assigned: "pickupTasks.status.driverAssigned",
  pickup_started: "pickupTasks.status.pickupStarted",
  collected: "pickupTasks.status.collected",
  delayed: "pickupTasks.status.delayed",
  cancelled: "pickupTasks.status.cancelled",
};

const PRIORITY_KEYS: Record<PickupPriority, string> = {
  high: "pickupTasks.priority.high",
  medium: "pickupTasks.priority.medium",
  low: "pickupTasks.priority.low",
};

const ACTION_KEYS: Record<PickupTaskAction, string> = {
  assign_driver: "pickupTasks.actions.assignDriver",
  start_pickup: "pickupTasks.actions.startPickup",
  mark_collected: "pickupTasks.actions.markCollected",
  mark_resolved: "pickupTasks.actions.markResolved",
  report_delay: "pickupTasks.actions.reportDelay",
  move_to_in_transit: "pickupTasks.actions.moveToInTransit",
  view_details: "pickupTasks.actions.viewDetails",
  open_route: "pickupTasks.actions.openRoute",
  contact_farmer: "pickupTasks.actions.contactFarmer",
};

const READINESS_KEYS: Record<PickupReadiness, string> = {
  ready_now: "pickupTasks.readiness.readyNow",
  packing: "pickupTasks.readiness.packingInProgress",
  waiting_driver: "pickupTasks.readiness.waitingForDriver",
  delayed: "pickupTasks.readiness.delayedReadiness",
};

const TIME_FILTER_KEYS: Record<PickupTimeFilter, string> = {
  today: "pickupTasks.filters.today",
  next_2_hours: "pickupTasks.filters.next2Hours",
  afternoon: "pickupTasks.filters.thisAfternoon",
  tomorrow: "pickupTasks.filters.tomorrow",
  week: "pickupTasks.filters.thisWeek",
  all: "pickupTasks.filters.allTime",
};

const ALERT_KEYS: Record<string, { title: string; description: string }> = {
  "pa-1": {
    title: "pickupTasks.alerts.items.pickupDelayed.title",
    description: "pickupTasks.alerts.items.pickupDelayed.description",
  },
  "pa-2": {
    title: "pickupTasks.alerts.items.earlyArrival.title",
    description: "pickupTasks.alerts.items.earlyArrival.description",
  },
  "pa-3": {
    title: "pickupTasks.alerts.items.driverNotAssigned.title",
    description: "pickupTasks.alerts.items.driverNotAssigned.description",
  },
  "pa-4": {
    title: "pickupTasks.alerts.items.productReadyNow.title",
    description: "pickupTasks.alerts.items.productReadyNow.description",
  },
  "pa-5": {
    title: "pickupTasks.alerts.items.roadIssue.title",
    description: "pickupTasks.alerts.items.roadIssue.description",
  },
};

const NOTE_KEYS: Record<string, string> = {
  "products are packed and ready near greenhouse entrance.":
    "pickupTasks.notes.packedReadyGreenhouseEntrance",
  "farmer is still packing crates in cold storage.":
    "pickupTasks.notes.packingCratesColdStorage",
  "heavy load. confirm truck access to field road.":
    "pickupTasks.notes.heavyLoadFieldRoad",
  "driver arrived. loading in progress.": "pickupTasks.notes.driverArrivedLoading",
  "road issue reported. farmer waiting with packed crates.":
    "pickupTasks.notes.roadIssuePackedCrates",
  "collected successfully. ready to move to in transit.":
    "pickupTasks.notes.collectedReadyInTransit",
  "fragile crates. farmer requested careful handling.":
    "pickupTasks.notes.fragileCratesCarefulHandling",
  "products cooled and staged at loading bay.":
    "pickupTasks.notes.cooledStagedLoadingBay",
  "driver assignment needed before morning route.":
    "pickupTasks.notes.driverAssignmentNeededMorningRoute",
};

const LOCATION_KEYS: Record<string, string> = {
  "quba apple farm": "pickupTasks.locations.qubaAppleFarm",
  "green plaza baku": "pickupTasks.locations.greenPlazaBaku",
  "sabirabad fields": "pickupTasks.locations.sabirabadFields",
  "sumqayit bazaar": "pickupTasks.locations.sumqayitBazaar",
  "gedebey farm": "pickupTasks.locations.gadabayFarm",
  "goycay orchard": "pickupTasks.locations.goycayOrchard",
  "premium foods baku": "pickupTasks.locations.premiumFoodsBaku",
  "seki vineyard": "pickupTasks.locations.shekiVineyard",
  "wine cellar baku": "pickupTasks.locations.wineCellarBaku",
  "quba pear farm": "pickupTasks.locations.qubaPearFarm",
  "masalli farm": "pickupTasks.locations.masalliFarm",
};

const ADDRESS_KEYS: Record<string, string> = {
  "quba, rustov village": "pickupTasks.addresses.qubaRustovVillage",
  "sabirabad, sirvan plain": "pickupTasks.addresses.sabirabadShirvanPlain",
  "gedebey, mountain fields": "pickupTasks.addresses.gadabayMountainFields",
  "goycay, pomegranate gardens": "pickupTasks.addresses.goycayPomegranateGardens",
  "lenkeran, coastal greenhouse": "pickupTasks.addresses.lankaranCoastalGreenhouse",
  "seki, mountain vineyard": "pickupTasks.addresses.shekiMountainVineyard",
  "quba, forest edge orchard": "pickupTasks.addresses.qubaForestEdgeOrchard",
  "masalli, coastal fields": "pickupTasks.addresses.masalliCoastalFields",
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

export function translatePickupStatus(t: TranslateFn, status: PickupTaskStatus): string {
  return t(STATUS_KEYS[status], status);
}

export function translatePickupPriority(t: TranslateFn, priority: PickupPriority): string {
  return t(PRIORITY_KEYS[priority], priority);
}

export function translatePickupAction(t: TranslateFn, action: PickupTaskAction): string {
  return t(ACTION_KEYS[action], action);
}

export function translatePickupReadiness(t: TranslateFn, readiness: PickupReadiness): string {
  return t(READINESS_KEYS[readiness], readiness);
}

export function translatePickupTimeFilter(t: TranslateFn, timeFilter: PickupTimeFilter): string {
  return t(TIME_FILTER_KEYS[timeFilter], timeFilter);
}

export function translatePickupProduct(
  t: TranslateFn,
  language: Language,
  task: PickupTask,
): string {
  if (task.productKey) return t(`pickupTasks.products.${task.productKey}`, task.productName);
  return getLocalizedProductName({ name: task.productName }, language, t);
}

export function translatePickupVariety(
  t: TranslateFn,
  language: Language,
  variety: string,
  sortKey?: string,
): string {
  if (sortKey) return t(`pickupTasks.sort.${sortKey}`, variety);
  const localized = resolveLocalizedVariety(variety);
  if (!localized) return variety;
  return localized[language] ?? variety;
}

export function translatePickupLocation(
  t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  const key = LOCATION_KEYS[normalize(value)];
  if (key) return t(key, value);
  return translateLogisticsLocation(t, value);
}

export function translatePickupRegion(t: TranslateFn, value: string): string {
  return translateLogisticsRegion(t, value);
}

export function translatePickupAddress(
  _t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  const key = ADDRESS_KEYS[normalize(value)];
  return key ? _t(key, value) : value;
}

export function translatePickupNotes(
  t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  const key = NOTE_KEYS[normalize(value)];
  return key ? t(key, value) : value;
}

export function translatePickupAlert(
  t: TranslateFn,
  alert: PickupAlert,
): { title: string; description: string } {
  const key = ALERT_KEYS[alert.id];
  if (!key) return { title: alert.title, description: alert.description };
  return {
    title: t(key.title, alert.title),
    description: t(key.description, alert.description),
  };
}
