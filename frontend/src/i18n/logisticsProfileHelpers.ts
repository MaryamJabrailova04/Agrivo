import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import { formatLocalizedScheduleSummary } from "./farmerDashboardProfileHelpers";
import { translateLogisticsRegion } from "./logisticsDashboardHelpers";
import type {
  DocumentStatus,
  LogisticsDashboardProfile,
  LogisticsPreferredContact,
} from "../app/utils/logisticsProfileStorage";
import type { WeekDay } from "../app/utils/workingSchedule";

const VEHICLE_TYPE_KEYS: Record<string, string> = {
  vans: "vans",
  Vans: "vans",
  miniTrucks: "miniTrucks",
  "Mini Trucks": "miniTrucks",
  refrigeratedTrucks: "refrigeratedTrucks",
  "Refrigerated Trucks": "refrigeratedTrucks",
  flatbedTrucks: "flatbedTrucks",
  "Flatbed Trucks": "flatbedTrucks",
  pickupTrucks: "pickupTrucks",
  "Pickup Trucks": "pickupTrucks",
};

const DELIVERY_TYPE_KEYS: Record<string, string> = {
  farmPickup: "farmPickup",
  "Farm pickup": "farmPickup",
  buyerDelivery: "buyerDelivery",
  "Buyer delivery": "buyerDelivery",
  intercityTransfer: "intercityTransfer",
  "Intercity transfer": "intercityTransfer",
  coldChainDelivery: "coldChainDelivery",
  "Cold chain delivery": "coldChainDelivery",
  sameDayDelivery: "sameDayDelivery",
  "Same-day delivery": "sameDayDelivery",
};

const ROUTE_KEYS: Record<string, string> = {
  lankaranBaku: "lankaranBaku",
  "Lənkəran → Baku": "lankaranBaku",
  "Lankaran → Baku": "lankaranBaku",
  qubaSumgayit: "qubaSumgayit",
  "Quba → Sumqayıt": "qubaSumgayit",
  "Quba → Sumgayit": "qubaSumgayit",
  ganjaBaku: "ganjaBaku",
  "Gəncə → Baku": "ganjaBaku",
  "Ganja → Baku": "ganjaBaku",
  goychayBaku: "goychayBaku",
  "Göyçay → Baku": "goychayBaku",
  shekiBaku: "shekiBaku",
  "Şəki → Baku": "shekiBaku",
};

const CONTACT_KEYS: Record<LogisticsPreferredContact, string> = {
  Phone: "phone",
  WhatsApp: "whatsapp",
  Email: "email",
};

const DOCUMENT_KEYS: Record<keyof LogisticsDashboardProfile["documents"], string> = {
  registration: "businessRegistration",
  transportLicense: "transportLicense",
  insurance: "insurance",
  vehicleDocs: "vehicleDocuments",
  driverVerification: "driverVerification",
};

const DOCUMENT_UPLOAD_KEYS: Record<keyof LogisticsDashboardProfile["documents"], string> = {
  registration: "uploadBusinessDocument",
  transportLicense: "uploadLicense",
  insurance: "uploadInsurance",
  vehicleDocs: "uploadVehicleDocs",
  driverVerification: "uploadDriverRecords",
};

const COMPLETION_ITEM_KEYS = [
  "companyName",
  "phoneNumber",
  "serviceRegions",
  "driversAndVehicles",
  "companyDescription",
  "workingHours",
] as const;

export function translateVehicleType(t: TranslateFn, value: string): string {
  const key = VEHICLE_TYPE_KEYS[value];
  return key ? t(`logisticsProfile.vehicleTypes.${key}`, value) : value;
}

export function translateDeliveryType(t: TranslateFn, value: string): string {
  const key = DELIVERY_TYPE_KEYS[value];
  return key ? t(`logisticsProfile.deliveryTypes.${key}`, value) : value;
}

export function translateServiceRegion(t: TranslateFn, region: string): string {
  return translateLogisticsRegion(t, region);
}

export function translateRouteLabel(t: TranslateFn, route: string): string {
  const key = ROUTE_KEYS[route];
  return key ? t(`logisticsProfile.routes.${key}`, route) : route;
}

export function translatePreferredContact(
  t: TranslateFn,
  method: LogisticsPreferredContact,
): string {
  return t(`logisticsProfile.contactMethods.${CONTACT_KEYS[method]}`, method);
}

export function translateDocumentStatus(t: TranslateFn, status: DocumentStatus): string {
  return t(`logisticsProfile.documentStatus.${status}`, status);
}

export function translateDocumentLabel(
  t: TranslateFn,
  key: keyof LogisticsDashboardProfile["documents"],
): string {
  return t(`logisticsProfile.documents.${DOCUMENT_KEYS[key]}`);
}

export function translateDocumentUploadLabel(
  t: TranslateFn,
  key: keyof LogisticsDashboardProfile["documents"],
): string {
  return t(`logisticsProfile.documents.${DOCUMENT_UPLOAD_KEYS[key]}`);
}

export function translateYesNo(t: TranslateFn, value: boolean): string {
  return value ? t("logisticsProfile.common.yes") : t("logisticsProfile.common.no");
}

export function getLocalizedDescription(
  profile: LogisticsDashboardProfile,
  language: Language,
): string {
  if (language === "az" && profile.descriptionAz?.trim()) {
    return profile.descriptionAz;
  }
  return profile.description;
}

export function getLocalizedAddress(
  profile: LogisticsDashboardProfile,
  language: Language,
  t: TranslateFn,
): string {
  if (profile.address?.trim()) {
    if (language === "az" && profile.addressAz?.trim()) return profile.addressAz;
    return profile.address;
  }
  return t("logisticsProfile.placeholders.headquartersAddress");
}

export function formatLocalizedDeliveryRadius(t: TranslateFn, radius: string): string {
  if (radius === "Up to 350 km") {
    return t("logisticsProfile.coverage.upTo350Km");
  }
  return radius;
}

export function formatLocalizedCapacity(t: TranslateFn, capacity: string): string {
  if (capacity === "10 tons") {
    return t("logisticsProfile.coverage.capacity10Tons");
  }
  return capacity;
}

export function formatLogisticsScheduleSummary(
  t: TranslateFn,
  language: Language,
  workingDays: WeekDay[],
  openingTime: string,
  closingTime: string,
): string {
  return formatLocalizedScheduleSummary(t, language, workingDays, openingTime, closingTime);
}

export function translateCompletionItem(t: TranslateFn, key: string): string {
  const normalized = key
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("phonenumber", "phoneNumber")
    .replace("companyname", "companyName")
    .replace("serviceregions", "serviceRegions")
    .replace("driversandvehicles", "driversAndVehicles")
    .replace("companydescription", "companyDescription")
    .replace("workinghours", "workingHours");

  const match = COMPLETION_ITEM_KEYS.find((item) => item.toLowerCase() === normalized);
  return match
    ? t(`logisticsProfile.completionItems.${match}`)
    : t(`logisticsProfile.completionItems.${key}`, key);
}

export function translateValidationError(t: TranslateFn, errorKey: string): string {
  return t(`logisticsProfile.validation.${errorKey}`, errorKey);
}

export function normalizeVehicleTypeKey(value: string): string {
  return VEHICLE_TYPE_KEYS[value] ?? value;
}

export function normalizeDeliveryTypeKey(value: string): string {
  return DELIVERY_TYPE_KEYS[value] ?? value;
}

export function normalizeRouteKey(value: string): string {
  return ROUTE_KEYS[value] ?? value;
}
