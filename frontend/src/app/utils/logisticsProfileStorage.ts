import type { AuthUser } from "../auth/authStorage";
import {
  normalizeDeliveryTypeKey,
  normalizeRouteKey,
  normalizeVehicleTypeKey,
} from "../../i18n/logisticsProfileHelpers";
import { LOGISTICS_PROFILE_SEED } from "../data/logisticsProfile";
import { migrateWorkingDays, type WeekDay } from "./workingSchedule";

export type { WeekDay };

export type LogisticsPreferredContact = "Phone" | "WhatsApp" | "Email";
export type DocumentStatus = "verified" | "pending" | "missing";

export interface LogisticsDocuments {
  registration: DocumentStatus;
  transportLicense: DocumentStatus;
  insurance: DocumentStatus;
  vehicleDocs: DocumentStatus;
  driverVerification: DocumentStatus;
}

export interface LogisticsDashboardProfile {
  companyName: string;
  contactPerson: string;
  registrationNumber: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  emergencyContact: string;
  preferredContactMethod: LogisticsPreferredContact;
  description: string;
  descriptionAz?: string;
  addressAz?: string;
  driversCount: number;
  vehiclesCount: number;
  vehicleTypes: string[];
  maxDailyCapacity: string;
  supportedDeliveryTypes: string[];
  coldChainSupport: boolean;
  sameDayDelivery: boolean;
  serviceRegions: string[];
  mainRoutes: string[];
  deliveryRadius: string;
  operatingHours: string;
  workingDays: WeekDay[];
  openingTime: string;
  closingTime: string;
  avatar: string | null;
  totalDeliveries: number;
  onTimeRate: number;
  rating: number;
  memberSince: string;
  verified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  documents: LogisticsDocuments;
}

export interface LogisticsProfileStats {
  totalDeliveries: number;
  activeDrivers: number;
  fleetSize: number;
  serviceRegions: number;
  onTimeRate: number;
}

export interface LogisticsProfileCompletion {
  percent: number;
  completedItems: string[];
  missingItems: string[];
}

const STORAGE_KEY_PREFIX = "agrivo_logistics_profile_";

export const LOGISTICS_VEHICLE_TYPES = [
  "vans",
  "miniTrucks",
  "refrigeratedTrucks",
  "flatbedTrucks",
  "pickupTrucks",
] as const;

export const LOGISTICS_DELIVERY_TYPES = [
  "farmPickup",
  "buyerDelivery",
  "intercityTransfer",
  "coldChainDelivery",
  "sameDayDelivery",
] as const;

export const LOGISTICS_SERVICE_REGIONS = [
  "Baku",
  "Abşeron-Xızı",
  "Lənkəran-Astara",
  "Quba-Xaçmaz",
  "Gəncə-Daşkəsən",
  "Şəki-Zaqatala",
  "Göyçay",
  "Sumqayıt",
] as const;

export const LOGISTICS_ROUTE_SUGGESTIONS = [
  "lankaranBaku",
  "qubaSumgayit",
  "ganjaBaku",
  "goychayBaku",
  "shekiBaku",
] as const;

export const LOGISTICS_PREFERRED_CONTACT_OPTIONS: LogisticsPreferredContact[] = [
  "Phone",
  "WhatsApp",
  "Email",
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  missing: "Missing",
};

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function resolveLogisticsProfileUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_logistics";
}

export function createDefaultLogisticsProfile(user: AuthUser): LogisticsDashboardProfile {
  return {
    ...LOGISTICS_PROFILE_SEED,
    contactPerson: user.name || LOGISTICS_PROFILE_SEED.contactPerson,
    phone: user.phone || LOGISTICS_PROFILE_SEED.phone,
    email: user.email || LOGISTICS_PROFILE_SEED.email,
    whatsapp: user.phone || LOGISTICS_PROFILE_SEED.whatsapp,
    vehicleTypes: [...LOGISTICS_PROFILE_SEED.vehicleTypes],
    supportedDeliveryTypes: [...LOGISTICS_PROFILE_SEED.supportedDeliveryTypes],
    serviceRegions: [...LOGISTICS_PROFILE_SEED.serviceRegions],
    mainRoutes: [...LOGISTICS_PROFILE_SEED.mainRoutes],
    workingDays: [...LOGISTICS_PROFILE_SEED.workingDays],
    documents: { ...LOGISTICS_PROFILE_SEED.documents },
  };
}

export function getLogisticsDashboardProfile(user: AuthUser): LogisticsDashboardProfile {
  const userId = resolveLogisticsProfileUserId(user);
  if (!userId) return createDefaultLogisticsProfile(user);

  try {
    const raw = localStorage.getItem(storageKey(userId));
    const defaults = createDefaultLogisticsProfile(user);
    if (!raw) {
      setLogisticsDashboardProfile(userId, defaults);
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<LogisticsDashboardProfile> & { workingDays?: unknown };
    return {
      ...defaults,
      ...parsed,
      workingDays: migrateWorkingDays(parsed.workingDays ?? defaults.workingDays),
      vehicleTypes: Array.isArray(parsed.vehicleTypes)
        ? parsed.vehicleTypes.map(normalizeVehicleTypeKey)
        : defaults.vehicleTypes,
      supportedDeliveryTypes: Array.isArray(parsed.supportedDeliveryTypes)
        ? parsed.supportedDeliveryTypes.map(normalizeDeliveryTypeKey)
        : defaults.supportedDeliveryTypes,
      serviceRegions: Array.isArray(parsed.serviceRegions)
        ? parsed.serviceRegions
        : defaults.serviceRegions,
      mainRoutes: Array.isArray(parsed.mainRoutes)
        ? parsed.mainRoutes.map(normalizeRouteKey)
        : defaults.mainRoutes,
      documents: parsed.documents ? { ...defaults.documents, ...parsed.documents } : defaults.documents,
    };
  } catch {
    return createDefaultLogisticsProfile(user);
  }
}

export function setLogisticsDashboardProfile(
  userId: string,
  profile: LogisticsDashboardProfile,
): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(profile));
}

export function cloneLogisticsProfile(
  profile: LogisticsDashboardProfile,
): LogisticsDashboardProfile {
  return {
    ...profile,
    vehicleTypes: [...profile.vehicleTypes],
    supportedDeliveryTypes: [...profile.supportedDeliveryTypes],
    serviceRegions: [...profile.serviceRegions],
    mainRoutes: [...profile.mainRoutes],
    workingDays: [...profile.workingDays],
    documents: { ...profile.documents },
  };
}

export function getProfileInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "2026";
  return String(date.getFullYear());
}

export function toggleArrayItem<T extends string>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function validateLogisticsProfile(
  profile: Pick<LogisticsDashboardProfile, "companyName" | "contactPerson" | "email" | "phone">,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!profile.companyName.trim()) errors.companyName = "companyNameRequired";
  if (!profile.contactPerson.trim()) errors.contactPerson = "contactPersonRequired";
  if (!profile.email.trim()) {
    errors.email = "emailRequired";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.email = "emailInvalid";
  }
  if (!profile.phone.trim()) errors.phone = "phoneRequired";
  return errors;
}

export function calculateProfileCompletion(
  profile: LogisticsDashboardProfile,
): LogisticsProfileCompletion {
  const checks = [
    { key: "companyName", done: Boolean(profile.companyName.trim()) },
    { key: "phoneNumber", done: Boolean(profile.phone.trim()) },
    { key: "serviceRegions", done: profile.serviceRegions.length > 0 },
    { key: "driversAndVehicles", done: profile.driversCount > 0 && profile.vehiclesCount > 0 },
    { key: "companyDescription", done: Boolean(profile.description.trim()) },
    {
      key: "workingHours",
      done: profile.workingDays.length > 0 && Boolean(profile.openingTime && profile.closingTime),
    },
  ];

  const completedItems = checks.filter((item) => item.done).map((item) => item.key);
  const missingItems = checks.filter((item) => !item.done).map((item) => item.key);
  const percent = Math.round((completedItems.length / checks.length) * 100);

  return { percent, completedItems, missingItems };
}

export function computeLogisticsProfileStats(
  profile: LogisticsDashboardProfile,
): LogisticsProfileStats {
  return {
    totalDeliveries: profile.totalDeliveries,
    activeDrivers: profile.driversCount,
    fleetSize: profile.vehiclesCount,
    serviceRegions: profile.serviceRegions.length,
    onTimeRate: profile.onTimeRate,
  };
}

export function getDocumentStatusStyles(status: DocumentStatus): string {
  switch (status) {
    case "verified":
      return "agrivo-logistics-doc-status--verified";
    case "pending":
      return "agrivo-logistics-doc-status--pending";
    default:
      return "agrivo-logistics-doc-status--missing";
  }
}

export function getVerificationStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABELS[status];
}

export { formatWorkingDays, formatScheduleSummary } from "./workingSchedule";
