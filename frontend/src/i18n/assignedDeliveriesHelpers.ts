import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import type {
  AssignedDateFilter,
  AssignedDelivery,
  AssignedDeliveryAction,
  AssignedDeliveryPriority,
  AssignedDeliveryStatus,
} from "../app/utils/assignedDeliveriesStorage";
import {
  getLocalizedProductName,
  resolveLocalizedVariety,
} from "./farmerProductHelpers";
import {
  translateLogisticsLocation,
  translateLogisticsRegion,
} from "./logisticsDashboardHelpers";

const BUYER_TYPE_KEYS: Record<string, string> = {
  supermarket: "assignedDeliveries.buyerTypes.supermarket",
  "retail chain": "assignedDeliveries.buyerTypes.retailChain",
  "wholesale market": "assignedDeliveries.buyerTypes.wholesaleMarket",
  "distribution hub": "assignedDeliveries.buyerTypes.distributionHub",
  "premium retailer": "assignedDeliveries.buyerTypes.premiumRetailer",
  "local market": "assignedDeliveries.buyerTypes.localMarket",
  "specialty buyer": "assignedDeliveries.buyerTypes.specialtyBuyer",
  market: "assignedDeliveries.buyerTypes.market",
  "supermarket chain": "assignedDeliveries.buyerTypes.supermarketChain",
};

const STATUS_KEYS: Record<AssignedDeliveryStatus, string> = {
  assigned: "assignedDeliveries.status.assigned",
  pickup_scheduled: "assignedDeliveries.status.pickupScheduled",
  picked_up: "assignedDeliveries.status.pickedUp",
  in_transit: "assignedDeliveries.status.inTransit",
  delivered: "assignedDeliveries.status.delivered",
  delayed: "assignedDeliveries.status.delayed",
  cancelled: "assignedDeliveries.status.cancelled",
};

const PRIORITY_KEYS: Record<AssignedDeliveryPriority, string> = {
  high: "assignedDeliveries.priority.high",
  medium: "assignedDeliveries.priority.medium",
  low: "assignedDeliveries.priority.low",
};

const ACTION_KEYS: Record<AssignedDeliveryAction, string> = {
  start_pickup: "assignedDeliveries.actions.startPickup",
  mark_picked_up: "assignedDeliveries.actions.markPickedUp",
  start_transit: "assignedDeliveries.actions.startTransit",
  mark_delivered: "assignedDeliveries.actions.markDelivered",
  mark_resolved: "assignedDeliveries.actions.markResolved",
  view_details: "assignedDeliveries.actions.viewDetails",
  open_route: "assignedDeliveries.actions.openRoute",
  contact: "assignedDeliveries.actions.contact",
};

const DATE_FILTER_KEYS: Record<AssignedDateFilter, string> = {
  today: "assignedDeliveries.filters.today",
  tomorrow: "assignedDeliveries.filters.tomorrow",
  week: "assignedDeliveries.filters.thisWeek",
  all: "assignedDeliveries.filters.allTime",
};

const DATE_LABEL_KEYS: Record<string, string> = {
  "today, 08:15": "assignedDeliveries.dateLabels.todayAt",
  "today, 07:40": "assignedDeliveries.dateLabels.todayAt",
  "today, 06:50": "assignedDeliveries.dateLabels.todayAt",
  "today, 08:00": "assignedDeliveries.dateLabels.todayAt",
  "today, 07:10": "assignedDeliveries.dateLabels.todayAt",
  "today, 05:30": "assignedDeliveries.dateLabels.todayAt",
  "tomorrow, 08:00": "assignedDeliveries.dateLabels.tomorrowAt",
  "this week, mon 10:20": "assignedDeliveries.dateLabels.thisWeekAt",
  "this week, sun 14:00": "assignedDeliveries.dateLabels.thisWeekAt",
};

const NOTE_KEYS: Record<string, string> = {
  "handle carefully. greenhouse tomatoes.": "assignedDeliveries.notes.handleCarefullyGreenhouseTomatoes",
};

const LOCATION_KEYS: Record<string, string> = {
  "quba orchard": "assignedDeliveries.locations.qubaOrchard",
  "green plaza baku": "assignedDeliveries.locations.greenPlazaBaku",
  "sabirabad fields": "assignedDeliveries.locations.sabirabadFields",
  "sumqayit bazaar": "assignedDeliveries.locations.sumqayitBazaar",
  "gedebey farm": "assignedDeliveries.locations.gedebeyFarm",
  "ganja hub": "assignedDeliveries.locations.ganjaHub",
  "goycay orchard": "assignedDeliveries.locations.goycayOrchard",
  "premium foods baku": "assignedDeliveries.locations.premiumFoodsBaku",
  "seki vineyard": "assignedDeliveries.locations.shekiVineyard",
  "wine cellar baku": "assignedDeliveries.locations.wineCellarBaku",
  "quba pear farm": "assignedDeliveries.locations.qubaPearFarm",
  "city grocery chain": "assignedDeliveries.locations.cityGroceryChain",
  "masalli farm": "assignedDeliveries.locations.masalliFarm",
};

const ADDRESS_KEYS: Record<string, string> = {
  "lankaran, seyidekaran village": "assignedDeliveries.addresses.lankaranSeyidekaran",
  "lenkeran, seyidekeran village": "assignedDeliveries.addresses.lankaranSeyidekaran",
  "lenkeran, seyidekaran village": "assignedDeliveries.addresses.lankaranSeyidekaran",
  "baku, narimanov district": "assignedDeliveries.addresses.bakuNarimanov",
  "quba, rustov village": "assignedDeliveries.addresses.qubaRustov",
  "baku, yasamal district": "assignedDeliveries.addresses.bakuYasamal",
  "sabirabad, shirvan plain": "assignedDeliveries.addresses.sabirabadShirvan",
  "sumqayit, city market zone": "assignedDeliveries.addresses.sumqayitMarketZone",
  "gedebey, mountain fields": "assignedDeliveries.addresses.gedebeyMountainFields",
  "gence, logistics terminal": "assignedDeliveries.addresses.ganjaLogisticsTerminal",
  "goycay, pomegranate gardens": "assignedDeliveries.addresses.goycayPomegranateGardens",
  "baku, nizami district": "assignedDeliveries.addresses.bakuNizami",
  "lenkeran, greenhouse zone": "assignedDeliveries.addresses.lankaranGreenhouseZone",
  "sumqayit, fresh market": "assignedDeliveries.addresses.sumqayitFreshMarket",
  "seki, mountain vineyard": "assignedDeliveries.addresses.shekiMountainVineyard",
  "baku, sabail district": "assignedDeliveries.addresses.bakuSabail",
  "quba, forest edge orchard": "assignedDeliveries.addresses.qubaForestEdgeOrchard",
  "baku, multiple store drop-off": "assignedDeliveries.addresses.bakuMultipleDropoff",
  "masalli, coastal fields": "assignedDeliveries.addresses.masalliCoastalFields",
  "baku, market district": "assignedDeliveries.addresses.bakuMarketDistrict",
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

export function translateAssignedStatus(t: TranslateFn, status: AssignedDeliveryStatus): string {
  return t(STATUS_KEYS[status], status);
}

export function translateAssignedPriority(
  t: TranslateFn,
  priority: AssignedDeliveryPriority,
): string {
  return t(PRIORITY_KEYS[priority], priority);
}

export function translateAssignedAction(
  t: TranslateFn,
  action: AssignedDeliveryAction,
): string {
  return t(ACTION_KEYS[action], action);
}

export function translateAssignedDateFilter(
  t: TranslateFn,
  dateFilter: AssignedDateFilter,
): string {
  return t(DATE_FILTER_KEYS[dateFilter], dateFilter);
}

export function translateAssignedDateLabel(t: TranslateFn, assignedAt: string): string {
  const key = DATE_LABEL_KEYS[normalize(assignedAt)];
  if (!key) return assignedAt;

  const [label, time] = assignedAt.split(",").map((part) => part.trim());
  if (!time) return t(key, assignedAt);
  return t(key, { time, label });
}

export function translateAssignedBuyerType(t: TranslateFn, buyerType: string): string {
  const key = BUYER_TYPE_KEYS[normalize(buyerType)];
  return key ? t(key, buyerType) : buyerType;
}

export function translateAssignedBuyerTypeValue(
  t: TranslateFn,
  delivery: AssignedDelivery,
): string {
  if (delivery.buyerTypeKey) {
    return t(`assignedDeliveries.buyerTypes.${delivery.buyerTypeKey}`, delivery.buyerType);
  }
  return translateAssignedBuyerType(t, delivery.buyerType);
}

export function translateAssignedProduct(
  t: TranslateFn,
  language: Language,
  delivery: AssignedDelivery,
): string {
  if (delivery.productKey) {
    return t(`assignedDeliveries.products.${delivery.productKey}`, delivery.productName);
  }
  return getLocalizedProductName({ name: delivery.productName }, language, t);
}

export function translateAssignedVariety(
  t: TranslateFn,
  language: Language,
  variety: string,
  sortKey?: string,
): string {
  if (sortKey) {
    return t(`assignedDeliveries.sort.${sortKey}`, variety);
  }
  const localized = resolveLocalizedVariety(variety);
  if (!localized) return variety;
  return localized[language] ?? variety;
}

export function translateAssignedLocation(
  t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) {
    return localized[language] ?? value;
  }
  const key = LOCATION_KEYS[normalize(value)];
  if (key) return t(key, value);
  return translateLogisticsLocation(t, value);
}

export function translateAssignedRegion(t: TranslateFn, value: string): string {
  return translateLogisticsRegion(t, value);
}

export function translateAssignedNotes(t: TranslateFn, notes: string): string {
  const key = NOTE_KEYS[normalize(notes)];
  return key ? t(key, notes) : notes;
}

export function translateAssignedAddress(t: TranslateFn, address: string): string {
  const key = ADDRESS_KEYS[normalize(address)];
  return key ? t(key, address) : address;
}

export function translateAssignedAddressValue(
  t: TranslateFn,
  address: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) {
    return localized[language] ?? address;
  }
  return translateAssignedAddress(t, address);
}
