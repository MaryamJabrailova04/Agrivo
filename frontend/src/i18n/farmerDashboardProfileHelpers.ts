import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import {
  translateFarmSize,
  translateFarmerCategory,
} from "./farmerHelpers";
import { getLocalizedProductName, translateDeliveryOption } from "./farmerProductHelpers";
import type { WeekDay } from "../app/utils/workingSchedule";
import { sortWorkingDays, WEEKDAY_ORDER } from "../app/utils/workingSchedule";

export const FARMER_PROFILE_CATEGORY_KEYS = [
  "fruits",
  "vegetables",
  "dairyProducts",
  "grains",
  "herbs",
  "other",
] as const;

export const FARMER_PROFILE_PRODUCT_KEYS = [
  "tomatoes",
  "apples",
  "watermelon",
  "potato",
  "cucumber",
  "pomegranate",
  "cherries",
  "pears",
  "grapes",
  "milk",
  "cheese",
] as const;

export const FARMER_PROFILE_DELIVERY_KEYS = [
  "farmerDelivery",
  "buyerPickup",
  "logisticsPartner",
] as const;

export const FARMER_PROFILE_PAYMENT_KEYS = [
  "cash",
  "bankTransfer",
  "onlinePayment",
] as const;

export const FARMER_PROFILE_CONTACT_KEYS = ["phone", "whatsapp", "email"] as const;

export type FarmerProfileCategoryKey = (typeof FARMER_PROFILE_CATEGORY_KEYS)[number];
export type FarmerProfileProductKey = (typeof FARMER_PROFILE_PRODUCT_KEYS)[number];
export type FarmerProfileDeliveryKey = (typeof FARMER_PROFILE_DELIVERY_KEYS)[number];
export type FarmerProfilePaymentKey = (typeof FARMER_PROFILE_PAYMENT_KEYS)[number];
export type FarmerProfileContactKey = (typeof FARMER_PROFILE_CONTACT_KEYS)[number];

const LEGACY_CATEGORY_TO_KEY: Record<string, FarmerProfileCategoryKey> = {
  fruits: "fruits",
  vegetables: "vegetables",
  dairyproducts: "dairyProducts",
  "dairy products": "dairyProducts",
  grains: "grains",
  herbs: "herbs",
  other: "other",
};

const LEGACY_PRODUCT_TO_KEY: Record<string, FarmerProfileProductKey> = {
  tomatoes: "tomatoes",
  tomato: "tomatoes",
  apples: "apples",
  apple: "apples",
  watermelon: "watermelon",
  potato: "potato",
  potatoes: "potato",
  cucumber: "cucumber",
  cucumbers: "cucumber",
  pomegranate: "pomegranate",
  cherries: "cherries",
  cherry: "cherries",
  pears: "pears",
  pear: "pears",
  grapes: "grapes",
  grape: "grapes",
  milk: "milk",
  cheese: "cheese",
};

const LEGACY_DELIVERY_TO_KEY: Record<string, FarmerProfileDeliveryKey> = {
  farmerdelivery: "farmerDelivery",
  "farmer delivery": "farmerDelivery",
  buyerpickup: "buyerPickup",
  "buyer pickup": "buyerPickup",
  logisticspartner: "logisticsPartner",
  "logistics partner": "logisticsPartner",
};

const LEGACY_PAYMENT_TO_KEY: Record<string, FarmerProfilePaymentKey> = {
  cash: "cash",
  banktransfer: "bankTransfer",
  "bank transfer": "bankTransfer",
  onlinepayment: "onlinePayment",
  "online payment": "onlinePayment",
};

const LEGACY_CONTACT_TO_KEY: Record<string, FarmerProfileContactKey> = {
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
};

const REGION_EN_LABELS: Record<string, string> = {
  "Lənkəran-Astara": "Lankaran-Astara",
  "Quba-Xaçmaz": "Quba-Khachmaz",
  "Gəncə-Daşkəsən": "Ganja-Dashkasan",
  "Şəki-Zaqatala": "Shaki-Zaqatala",
  Bakı: "Baku",
  "Mərkəzi Aran": "Central Aran",
  "Abşeron-Xızı": "Absheron-Khizi",
  Qarabağ: "Karabakh",
  "Dağlıq Şirvan": "Mountainous Shirvan",
  "Cənub Qərb": "Southwest",
  "Şirvan": "Shirvan",
};

const DISTRICT_EN_LABELS: Record<string, string> = {
  "Lənkəran rayonu": "Lankaran district",
  "Lənkəran şəhəri": "Lankaran city",
};

const KNOWN_DESCRIPTION_KEY =
  "We grow fresh greenhouse tomatoes, seasonal fruits, and local vegetables using careful farming methods.";

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function normalizeCategoryKey(value: string): FarmerProfileCategoryKey | null {
  const trimmed = value.trim();
  if ((FARMER_PROFILE_CATEGORY_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as FarmerProfileCategoryKey;
  }
  return LEGACY_CATEGORY_TO_KEY[normalizeLookupKey(trimmed)] ?? null;
}

export function normalizeProductKey(value: string): FarmerProfileProductKey | null {
  const trimmed = value.trim();
  if ((FARMER_PROFILE_PRODUCT_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as FarmerProfileProductKey;
  }
  return LEGACY_PRODUCT_TO_KEY[normalizeLookupKey(trimmed)] ?? null;
}

export function normalizeDeliveryKey(value: string): FarmerProfileDeliveryKey | null {
  const trimmed = value.trim();
  if ((FARMER_PROFILE_DELIVERY_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as FarmerProfileDeliveryKey;
  }
  return LEGACY_DELIVERY_TO_KEY[normalizeLookupKey(trimmed)] ?? null;
}

export function normalizePaymentKey(value: string): FarmerProfilePaymentKey | null {
  const trimmed = value.trim();
  if ((FARMER_PROFILE_PAYMENT_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as FarmerProfilePaymentKey;
  }
  return LEGACY_PAYMENT_TO_KEY[normalizeLookupKey(trimmed)] ?? null;
}

export function normalizeContactKey(value: string): FarmerProfileContactKey | null {
  const trimmed = value.trim();
  if ((FARMER_PROFILE_CONTACT_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as FarmerProfileContactKey;
  }
  return LEGACY_CONTACT_TO_KEY[normalizeLookupKey(trimmed)] ?? null;
}

export function getLocalizedCategory(keyOrLegacy: string, language: Language, t: TranslateFn): string {
  const key = normalizeCategoryKey(keyOrLegacy);
  if (key) return t(`farmerDashboardProfile.categories.${key}`);
  return translateFarmerCategory(t, keyOrLegacy);
}

export function getLocalizedProduct(keyOrLegacy: string, language: Language, t: TranslateFn): string {
  const key = normalizeProductKey(keyOrLegacy);
  if (key) return t(`farmerDashboardProfile.products.${key}`);
  return getLocalizedProductName({ name: keyOrLegacy }, language, t);
}

export function getLocalizedDeliveryOption(keyOrLegacy: string, t: TranslateFn): string {
  const key = normalizeDeliveryKey(keyOrLegacy);
  if (key) return t(`farmerDashboardProfile.deliveryOptions.${key}`);
  return translateDeliveryOption(t, keyOrLegacy);
}

export function getLocalizedPaymentMethod(keyOrLegacy: string, t: TranslateFn): string {
  const key = normalizePaymentKey(keyOrLegacy);
  if (key) return t(`farmerDashboardProfile.paymentMethods.${key}`);
  return keyOrLegacy;
}

export function getLocalizedContactMethod(keyOrLegacy: string, t: TranslateFn): string {
  const key = normalizeContactKey(keyOrLegacy);
  if (key) return t(`farmerDashboardProfile.contactMethods.${key}`);
  return keyOrLegacy;
}

export function getLocalizedRegion(region: string, language: Language): string {
  if (!region) return region;
  if (language === "az") return region;
  return REGION_EN_LABELS[region] ?? region;
}

export function getLocalizedDistrict(district: string, language: Language): string {
  if (!district) return district;
  if (language === "az") return district;
  return DISTRICT_EN_LABELS[district] ?? district.replace(/ rayonu/g, " district").replace(/ şəhəri/g, " city");
}

export function translateProfileDescription(t: TranslateFn, description: string): string {
  if (description.trim() === KNOWN_DESCRIPTION_KEY) {
    return t("farmerDashboardProfile.descriptions.defaultDemo");
  }
  return description;
}

export function translateLocalizedFarmSize(t: TranslateFn, farmSize: string): string {
  return translateFarmSize(t, farmSize);
}

export function translateLocalizedMainProducts(t: TranslateFn, products: string[]): string {
  return products.map((product) => getLocalizedProduct(product, "en", t)).join(", ");
}

export function formatLocalizedMemberSince(t: TranslateFn, year: string): string {
  return t("farmerDashboardProfile.memberSince", { year });
}

export function formatLocalizedOwnerLine(t: TranslateFn, ownerName: string): string {
  return t("farmerDashboardProfile.ownerLine", { name: ownerName || t("farmerDashboardProfile.placeholders.ownerName") });
}

export function formatLocalizedRating(t: TranslateFn, rating: number): string {
  return t("farmerDashboardProfile.ratingValue", { rating: rating.toFixed(1) });
}

export function formatLocalizedScheduleSummary(
  t: TranslateFn,
  language: Language,
  days: WeekDay[],
  openingTime: string,
  closingTime: string,
): string {
  const sorted = sortWorkingDays(days);
  if (sorted.length === 0) return t("farmerDashboardProfile.schedule.selectDay");

  const daysLabel = formatLocalizedDayRange(t, language, sorted);
  if (openingTime && closingTime) {
    const hours =
      language === "az"
        ? `${openingTime} - ${closingTime}`
        : `${formatTime12h(openingTime)} - ${formatTime12h(closingTime)}`;
    return t("farmerDashboardProfile.schedule.openSummary", { days: daysLabel, hours });
  }
  return t("farmerDashboardProfile.schedule.openDaysOnly", { days: daysLabel });
}

export function formatLocalizedPublicSchedule(
  t: TranslateFn,
  language: Language,
  days: WeekDay[],
  openingTime: string,
  closingTime: string,
): { daysLine: string; hoursLine: string } | null {
  const sorted = sortWorkingDays(days);
  if (sorted.length === 0) return null;

  const daysLine = formatLocalizedDayRange(t, language, sorted);
  const hoursLine =
    openingTime && closingTime
      ? language === "az"
        ? `${openingTime} - ${closingTime}`
        : `${formatTime12h(openingTime)} - ${formatTime12h(closingTime)}`
      : "";

  return { daysLine, hoursLine };
}

function formatLocalizedDayRange(t: TranslateFn, language: Language, days: WeekDay[]): string {
  if (days.length === 7) return t("farmerDashboardProfile.schedule.everyDay");

  const runs: WeekDay[][] = [];
  let current: WeekDay[] = [];

  for (const day of WEEKDAY_ORDER) {
    if (days.includes(day)) {
      current.push(day);
    } else if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }
  if (current.length > 0) runs.push(current);

  if (runs.length === 1 && runs[0].length > 2) {
    const run = runs[0];
    return t("farmerDashboardProfile.schedule.dayRange", {
      start: t(`farmerDashboardProfile.weekdays.${run[0]}`),
      end: t(`farmerDashboardProfile.weekdays.${run[run.length - 1]}`),
    });
  }

  return days.map((day) => t(`farmerDashboardProfile.weekdaysShort.${day}`)).join(", ");
}

function formatTime12h(time: string): string {
  const [hourPart, minutePart] = time.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export function translateCompletionItem(t: TranslateFn, key: string): string {
  return t(`farmerDashboardProfile.completionItems.${key}`, key);
}

export function translateProfileError(t: TranslateFn, errorKey: string): string {
  return t(errorKey, errorKey);
}

export function formatLocalizedLocation(
  t: TranslateFn,
  language: Language,
  profile: { district?: string; region?: string; address?: string },
): string {
  const district = profile.district?.replace(/ rayonu| şəhəri/g, "").trim();
  if (district && profile.region) {
    return `${getLocalizedDistrict(profile.district, language)}, ${getLocalizedRegion(profile.region, language)}`;
  }
  return profile.address || t("farmerDashboardProfile.placeholders.location");
}

export function formatLocalizedPublicLocation(
  t: TranslateFn,
  language: Language,
  profile: { district?: string },
): string {
  const district = profile.district?.replace(/ rayonu| şəhəri/g, "").trim();
  return district
    ? t("farmerDashboardProfile.publicLocation", { district: getLocalizedDistrict(profile.district ?? "", language) })
    : t("farmerDashboardProfile.placeholders.location");
}
