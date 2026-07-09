import type { AuthUser } from "../auth/authStorage";
import { economicRegions, getDistrictsForRegion, type EconomicRegion } from "../data/azerbaijanRegions";
import {
  normalizeCategoryKey,
  normalizeContactKey,
  normalizeDeliveryKey,
  normalizePaymentKey,
  normalizeProductKey,
  type FarmerProfileCategoryKey,
  type FarmerProfileContactKey,
  type FarmerProfileDeliveryKey,
  type FarmerProfilePaymentKey,
} from "../../i18n/farmerDashboardProfileHelpers";
import { computeFarmerOrdersSummary, getFarmerOrders } from "./farmerOrdersStorage";
import { getFarmerProducts } from "./farmerProductsStorage";
import { migrateWorkingDays, type WeekDay } from "./workingSchedule";

export type { WeekDay };

export type FarmerProfileCategory = FarmerProfileCategoryKey | string;
export type FarmerProfileDeliveryOption = FarmerProfileDeliveryKey | string;
export type FarmerProfilePaymentMethod = FarmerProfilePaymentKey | string;
export type FarmerPreferredContact = FarmerProfileContactKey | string;

export interface FarmerDashboardProfile {
  farmName: string;
  ownerName: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  preferredContact: FarmerPreferredContact;
  description: string;
  mainCategories: FarmerProfileCategory[];
  mainProducts: string[];
  farmSize: string;
  minimumOrder: string;
  deliveryOptions: FarmerProfileDeliveryOption[];
  paymentMethods: FarmerProfilePaymentMethod[];
  workingDays: WeekDay[];
  openingTime: string;
  closingTime: string;
  avatar: string | null;
  rating: number;
  memberSince: string;
  verified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
}

export interface FarmerProfileStats {
  activeProducts: number;
  completedOrders: number;
  totalRevenue: number;
  rating: number;
}

export interface FarmerProfileCompletion {
  percent: number;
  completedItems: string[];
  missingItems: string[];
}

const STORAGE_KEY_PREFIX = "agrivo_farmer_profile_";

export const FARMER_PROFILE_CATEGORIES: FarmerProfileCategoryKey[] = [
  "fruits",
  "vegetables",
  "dairyProducts",
  "grains",
  "herbs",
  "other",
];

export const FARMER_PROFILE_DELIVERY_OPTIONS: FarmerProfileDeliveryKey[] = [
  "farmerDelivery",
  "buyerPickup",
  "logisticsPartner",
];

export const FARMER_PROFILE_PAYMENT_METHODS: FarmerProfilePaymentKey[] = [
  "cash",
  "bankTransfer",
  "onlinePayment",
];

export const FARMER_PROFILE_PRODUCT_SUGGESTIONS = [
  "tomatoes",
  "apples",
  "watermelon",
  "potato",
  "cucumber",
  "pomegranate",
  "cherries",
  "pears",
] as const;

export const FARMER_PREFERRED_CONTACT_OPTIONS: FarmerProfileContactKey[] = [
  "phone",
  "whatsapp",
  "email",
];

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function resolveFarmerProfileUserId(user: AuthUser | null): string | null {
  if (!user) return null;
  return user.id || "demo_farmer";
}

export function createDefaultFarmerProfile(user: AuthUser): FarmerDashboardProfile {
  return {
    farmName: "Hasanov Green Farm",
    ownerName: user.name || "Demo Farmer",
    region: "Lənkəran-Astara",
    district: "Lənkəran rayonu",
    address: "Seyidəkəran village",
    phone: user.phone || "+994 50 123 45 67",
    email: user.email || "farmer@agrivo.az",
    whatsapp: user.phone || "+994 50 123 45 67",
    preferredContact: "whatsapp",
    description:
      "We grow fresh greenhouse tomatoes, seasonal fruits, and local vegetables using careful farming methods.",
    mainCategories: ["fruits", "vegetables"],
    mainProducts: ["tomatoes", "apples", "watermelon"],
    farmSize: "5 hectares",
    minimumOrder: "50 kg",
    deliveryOptions: ["farmerDelivery", "buyerPickup", "logisticsPartner"],
    paymentMethods: ["cash", "bankTransfer"],
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    openingTime: "09:00",
    closingTime: "18:00",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    memberSince: "2026-01-15T00:00:00.000Z",
    verified: true,
    phoneVerified: true,
    identityVerified: true,
  };
}

function migrateProfileValues(profile: Partial<FarmerDashboardProfile>): Partial<FarmerDashboardProfile> {
  return {
    ...profile,
    mainCategories: Array.isArray(profile.mainCategories)
      ? profile.mainCategories
          .map((item) => normalizeCategoryKey(item) ?? item)
          .filter(Boolean)
      : profile.mainCategories,
    mainProducts: Array.isArray(profile.mainProducts)
      ? profile.mainProducts.map((item) => normalizeProductKey(item) ?? item).filter(Boolean)
      : profile.mainProducts,
    deliveryOptions: Array.isArray(profile.deliveryOptions)
      ? profile.deliveryOptions
          .map((item) => normalizeDeliveryKey(item) ?? item)
          .filter(Boolean)
      : profile.deliveryOptions,
    paymentMethods: Array.isArray(profile.paymentMethods)
      ? profile.paymentMethods.map((item) => normalizePaymentKey(item) ?? item).filter(Boolean)
      : profile.paymentMethods,
    preferredContact: profile.preferredContact
      ? normalizeContactKey(String(profile.preferredContact)) ?? profile.preferredContact
      : profile.preferredContact,
  };
}

export function getFarmerDashboardProfile(user: AuthUser): FarmerDashboardProfile {
  const userId = resolveFarmerProfileUserId(user);
  if (!userId) return createDefaultFarmerProfile(user);

  try {
    const raw = localStorage.getItem(storageKey(userId));
    const defaults = createDefaultFarmerProfile(user);
    if (!raw) {
      setFarmerDashboardProfile(userId, defaults);
      return defaults;
    }

    const parsed = migrateProfileValues(
      JSON.parse(raw) as Partial<FarmerDashboardProfile> & { workingDays?: unknown },
    );
    return {
      ...defaults,
      ...parsed,
      workingDays: migrateWorkingDays(parsed.workingDays ?? defaults.workingDays),
      mainCategories: Array.isArray(parsed.mainCategories)
        ? parsed.mainCategories
        : defaults.mainCategories,
      mainProducts: Array.isArray(parsed.mainProducts) ? parsed.mainProducts : defaults.mainProducts,
      deliveryOptions: Array.isArray(parsed.deliveryOptions)
        ? parsed.deliveryOptions
        : defaults.deliveryOptions,
      paymentMethods: Array.isArray(parsed.paymentMethods)
        ? parsed.paymentMethods
        : defaults.paymentMethods,
    };
  } catch {
    return createDefaultFarmerProfile(user);
  }
}

export function setFarmerDashboardProfile(userId: string, profile: FarmerDashboardProfile): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(profile));
}

export function cloneFarmerProfile(profile: FarmerDashboardProfile): FarmerDashboardProfile {
  return {
    ...profile,
    mainCategories: [...profile.mainCategories],
    mainProducts: [...profile.mainProducts],
    deliveryOptions: [...profile.deliveryOptions],
    paymentMethods: [...profile.paymentMethods],
    workingDays: [...profile.workingDays],
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

export function formatLocation(profile: Pick<FarmerDashboardProfile, "district" | "region" | "address">): string {
  const district = profile.district?.replace(/ rayonu| şəhəri/g, "").trim();
  if (district && profile.region) {
    return `${district}, ${profile.region}`;
  }
  return profile.address || "Add location";
}

export function getPublicLocationLine(profile: FarmerDashboardProfile): string {
  const district = profile.district?.replace(/ rayonu| şəhəri/g, "").trim();
  return district ? `${district}, Azerbaijan` : "Add location";
}

export function validateFarmerProfile(
  profile: Pick<FarmerDashboardProfile, "farmName" | "ownerName" | "email" | "phone">,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!profile.farmName.trim()) errors.farmName = "farmerDashboardProfile.errors.farmNameRequired";
  if (!profile.ownerName.trim()) errors.ownerName = "farmerDashboardProfile.errors.ownerNameRequired";
  if (!profile.email.trim()) {
    errors.email = "farmerDashboardProfile.errors.emailRequired";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.email = "farmerDashboardProfile.errors.emailInvalid";
  }
  if (!profile.phone.trim()) errors.phone = "farmerDashboardProfile.errors.phoneRequired";
  return errors;
}

export function computeProfileCompletion(profile: FarmerDashboardProfile): FarmerProfileCompletion {
  const checks = [
    { key: "farmName", done: Boolean(profile.farmName.trim()) },
    { key: "phoneNumber", done: Boolean(profile.phone.trim()) },
    { key: "region", done: Boolean(profile.region.trim()) },
    { key: "farmDescription", done: Boolean(profile.description.trim()) },
    { key: "mainProducts", done: profile.mainProducts.length > 0 },
  ];

  const completedItems = checks.filter((item) => item.done).map((item) => item.key);
  const missingItems = checks.filter((item) => !item.done).map((item) => item.key);
  const percent = Math.round((completedItems.length / checks.length) * 100);

  return { percent, completedItems, missingItems };
}

export function computeFarmerProfileStats(userId: string, profile: FarmerDashboardProfile): FarmerProfileStats {
  const products = getFarmerProducts(userId).filter(
    (product) => !product.archived && product.listingStatus === "active",
  );
  const orders = getFarmerOrders(userId);
  const orderSummary = computeFarmerOrdersSummary(orders);
  const revenue = orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.totalPrice, 0);

  return {
    activeProducts: products.length > 0 ? products.length : 12,
    completedOrders: orderSummary.completed > 0 ? orderSummary.completed : 48,
    totalRevenue: revenue > 0 ? revenue : 2450,
    rating: profile.rating,
  };
}

export function getRegionOptions(): string[] {
  return [...economicRegions];
}

export function getDistrictOptions(region: string): string[] {
  if (!region || !economicRegions.includes(region as EconomicRegion)) return [];
  return getDistrictsForRegion(region as EconomicRegion);
}

export function toggleArrayItem<T extends string>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}
