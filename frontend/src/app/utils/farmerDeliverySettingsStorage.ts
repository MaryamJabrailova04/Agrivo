import {
  DEFAULT_WORKING_DAYS,
  type FarmerDeliverySettings,
  type FarmerVehicleType,
  type Weekday,
} from "../data/deliveryTypes";

const STORAGE_KEY = "agrivo_farmer_delivery_settings";
export const FARMER_DELIVERY_SETTINGS_CHANGED = "agrivo-farmer-delivery-settings-changed";

function notify(): void {
  window.dispatchEvent(new Event(FARMER_DELIVERY_SETTINGS_CHANGED));
}

function readAll(): Record<string, FarmerDeliverySettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, FarmerDeliverySettings>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  notify();
}

export function createDefaultFarmerDeliverySettings(
  farmerSlug: string,
  overrides: Partial<FarmerDeliverySettings> = {},
): FarmerDeliverySettings {
  return {
    farmerSlug,
    farmerDeliveryEnabled: true,
    deliveryFee: 2,
    radiusKm: 20,
    workingDays: [...DEFAULT_WORKING_DAYS],
    deliveryHoursStart: "09:00",
    deliveryHoursEnd: "19:00",
    maxDailyDeliveries: 8,
    vehicleType: "pickup" as FarmerVehicleType,
    logisticsEnabled: true,
    logisticsFee: 3,
    pickupEnabled: true,
    pickupAddress: "Farm gate · main road entrance",
    pickupHoursStart: "08:00",
    pickupHoursEnd: "19:00",
    pickupPrepMinutes: 25,
    sameDayAvailable: true,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function getFarmerDeliverySettings(farmerSlug: string | null | undefined): FarmerDeliverySettings {
  const slug = farmerSlug?.trim() || "default-farmer";
  const all = readAll();
  if (all[slug]) return all[slug];
  const defaults = createDefaultFarmerDeliverySettings(slug);
  // Deterministic variety for marketplace demos
  const hash = slug.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  if (hash % 5 === 0) {
    defaults.farmerDeliveryEnabled = false;
  }
  if (hash % 7 === 0) {
    defaults.deliveryFee = 0;
  }
  if (hash % 3 === 0) {
    defaults.logisticsFee = 4;
  }
  if (hash % 11 === 0) {
    defaults.sameDayAvailable = false;
  }
  return defaults;
}

export function saveFarmerDeliverySettings(
  settings: FarmerDeliverySettings,
): FarmerDeliverySettings {
  const all = readAll();
  const next = {
    ...settings,
    workingDays: settings.workingDays.filter(Boolean) as Weekday[],
    updatedAt: new Date().toISOString(),
  };
  all[settings.farmerSlug] = next;
  writeAll(all);
  return next;
}

export function isFreeDelivery(settings: FarmerDeliverySettings): boolean {
  return (
    (settings.farmerDeliveryEnabled && settings.deliveryFee === 0) ||
    (settings.logisticsEnabled && settings.logisticsFee === 0)
  );
}

export function isFastDelivery(settings: FarmerDeliverySettings): boolean {
  return settings.sameDayAvailable;
}
