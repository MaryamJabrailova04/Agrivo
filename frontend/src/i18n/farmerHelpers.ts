import type { FarmerProduct, FarmerProfile, FarmerReview } from "../app/data/farmers";
import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import { translateProductDescription } from "./productDetailHelpers";
import {
  translateLandingCategory,
  translateLandingExperience,
  translateLandingProductName,
} from "./landingHelpers";

const SPECIALTY_KEYS: Record<string, string> = {
  Yogurt: "farmersPage.specialties.yogurt",
  "Fresh Milk": "farmersPage.specialties.freshMilk",
  Pears: "landing.categories.pears",
  Milk: "landing.categories.milk",
  Cheese: "landing.categories.cheese",
};

const ABOUT_KEYS: Record<string, string> = {
  "ali-hasanov": "farmerDetail.about.aliHasanov",
  "aysel-mammadova": "farmerDetail.about.ayselMammadova",
  "murad-karimov": "farmerDetail.about.muradKarimov",
  "leyla-abbasova": "farmerDetail.about.leylaAbbasova",
  "rashad-aliyev": "farmerDetail.about.rashadAliyev",
  "nigar-safarova": "farmerDetail.about.nigarSafarova",
};

const REVIEW_KEYS: Record<string, string> = {
  "Tomatoes arrived fresh and well packed. Communication was quick and professional.":
    "farmerDetail.reviews.aliHasanov1",
  "Reliable weekly supply with consistent quality from Ali's farm.":
    "farmerDetail.reviews.aliHasanov2",
  "Excellent fruit quality and transparent availability updates every week.":
    "farmerDetail.reviews.ayselMammadova1",
  "Aysel's pears are a customer favorite. Smooth ordering through Agrivo.":
    "farmerDetail.reviews.ayselMammadova2",
  "Milk and cheese quality is consistently high. Murad is responsive on WhatsApp.":
    "farmerDetail.reviews.muradKarimov1",
  "Great partner for dairy supply with clear batch availability on Agrivo.":
    "farmerDetail.reviews.muradKarimov2",
  "Consistent potato quality and clear order communication every week.":
    "farmerDetail.reviews.leylaAbbasova1",
  "Carrots arrived fresh and well graded. Easy to reorder on Agrivo.":
    "farmerDetail.reviews.leylaAbbasova2",
  "Reliable dairy supply with excellent freshness and punctual delivery.":
    "farmerDetail.reviews.rashadAliyev1",
  "Yogurt quality is excellent. Rashad is very responsive on WhatsApp.":
    "farmerDetail.reviews.rashadAliyev2",
  "Cherries were outstanding during peak season. Great communication.":
    "farmerDetail.reviews.nigarSafarova1",
  "Apples arrived in excellent condition. Will order again through Agrivo.":
    "farmerDetail.reviews.nigarSafarova2",
};

const DELIVERY_SUPPORT_KEYS: Record<string, string> = {
  "Yes — regional handoff": "farmerDetail.farmDetails.regionalHandoff",
  "Yes — cold-chain ready": "farmerDetail.farmDetails.coldChainReady",
  "Yes — chilled transport": "farmerDetail.farmDetails.chilledTransport",
  "Yes — regional routes": "farmerDetail.farmDetails.regionalRoutes",
  "Yes — daily city routes": "farmerDetail.farmDetails.dailyCityRoutes",
  "Yes — orchard pickup routes": "farmerDetail.farmDetails.orchardPickupRoutes",
};

const LOCATION_KEYS: Record<string, string> = {
  Lankaran: "farmerDetail.locations.lankaran",
  "Lankaran, Azerbaijan": "farmerDetail.locations.lankaranAzerbaijan",
  Quba: "farmerDetail.locations.quba",
  "Quba, Azerbaijan": "farmerDetail.locations.qubaAzerbaijan",
  Shaki: "farmerDetail.locations.shaki",
  "Shaki, Azerbaijan": "farmerDetail.locations.shakiAzerbaijan",
  Ganja: "farmerDetail.locations.ganja",
  "Ganja, Azerbaijan": "farmerDetail.locations.ganjaAzerbaijan",
  Baku: "farmerDetail.locations.baku",
  "Baku, Azerbaijan": "farmerDetail.locations.bakuAzerbaijan",
};

const HARVEST_SEASON_KEYS: Record<string, string> = {
  "March – November": "farmerDetail.farmDetails.marchNovember",
  "March–November": "farmerDetail.farmDetails.marchNovember",
  "August – November": "farmerDetail.farmDetails.augustNovember",
  "August–November": "farmerDetail.farmDetails.augustNovember",
  "June – October": "farmerDetail.farmDetails.juneOctober",
  "June–October": "farmerDetail.farmDetails.juneOctober",
  "May – November": "farmerDetail.farmDetails.mayNovember",
  "May–November": "farmerDetail.farmDetails.mayNovember",
  "Year-round production": "farmerDetail.farmDetails.yearRound",
};

const JOB_TITLE_KEYS: Record<string, string> = {
  "Tomato Greenhouse Helper": "farmerDetail.jobs.titles.tomatoGreenhouseHelper",
  "Hazelnut Collection Workers": "farmerDetail.jobs.titles.hazelnutCollectionWorkers",
};

function lookup(t: TranslateFn, map: Record<string, string>, value: string): string {
  const key = map[value];
  return key ? t(key, value) : value;
}

export function translateFarmerSpecialty(t: TranslateFn, specialty: string): string {
  const fromSpecialty = lookup(t, SPECIALTY_KEYS, specialty);
  if (fromSpecialty !== specialty) return fromSpecialty;

  const fromProduct = translateLandingProductName(t, specialty);
  if (fromProduct !== specialty) return fromProduct;

  return translateLandingCategory(t, specialty);
}

export function translateFarmerCategory(t: TranslateFn, category: string): string {
  return translateLandingCategory(t, category);
}

export function translateFarmerAbout(t: TranslateFn, farmer: FarmerProfile): string {
  const key = ABOUT_KEYS[farmer.slug];
  if (key) return t(key, farmer.about);
  return farmer.about;
}

export function translateFarmerReview(t: TranslateFn, review: FarmerReview): string {
  return lookup(t, REVIEW_KEYS, review.text);
}

export function translateFarmerLocation(t: TranslateFn, location: string): string {
  return lookup(t, LOCATION_KEYS, location);
}

export function formatFarmerQuantity(t: TranslateFn, quantity: string): string {
  return quantity.replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, `$1 ${t("farmerDetail.products.kgAbbrev")}`);
}

export function translateJobTitle(t: TranslateFn, title: string): string {
  return lookup(t, JOB_TITLE_KEYS, title);
}

export function formatFarmerExperienceLine(t: TranslateFn, experience: string): string {
  const match = experience.match(/^(\d+)\s*years?$/i);
  if (match) {
    return t("farmerDetail.experienceLine").replace("{years}", match[1]);
  }
  return experience;
}

export function translateFarmSize(t: TranslateFn, farmSize: string): string {
  const match = farmSize.match(/^([\d.]+)\s*hectares?$/i);
  if (match) {
    return `${match[1]} ${t("farmerDetail.farmDetails.hectares")}`;
  }
  return farmSize;
}

export function translateFarmExperience(t: TranslateFn, experience: string): string {
  return translateLandingExperience(t, experience);
}

export function translateMainProducts(t: TranslateFn, products: string): string {
  return products
    .split(",")
    .map((item) => translateFarmerSpecialty(t, item.trim()))
    .join(", ");
}

export function translateDeliverySupport(t: TranslateFn, value: string): string {
  return lookup(t, DELIVERY_SUPPORT_KEYS, value);
}

export function translateHarvestSeason(t: TranslateFn, value: string): string {
  return lookup(t, HARVEST_SEASON_KEYS, value);
}

export function translateFarmDetailValue(
  t: TranslateFn,
  field: keyof FarmerProfile["farmDetails"],
  value: string,
): string {
  switch (field) {
    case "location":
      return translateFarmerLocation(t, value);
    case "farmSize":
      return translateFarmSize(t, value);
    case "experience":
      return translateFarmExperience(t, value);
    case "mainProducts":
      return translateMainProducts(t, value);
    case "minimumOrder":
      return formatFarmerQuantity(t, value);
    case "deliverySupport":
      return translateDeliverySupport(t, value);
    case "harvestSeason":
      return translateHarvestSeason(t, value);
    default:
      return value;
  }
}

export function localizeFarmerProduct(t: TranslateFn, product: FarmerProduct) {
  return {
    name: translateLandingProductName(t, product.name),
    category: translateFarmerCategory(t, product.category),
    description: translateProductDescription(t, product.description, product.name),
    price: product.price,
    unit: formatProductUnit(t, product.unit),
    available: formatFarmerQuantity(t, product.available),
  };
}

export function formatProductUnit(t: TranslateFn, unit: string): string {
  if (unit === "AZN/kg") return t("farmerDetail.products.priceUnit");
  if (unit === "AZN/liter") return t("farmerDetail.products.priceUnitLiter");
  return unit;
}

export function formatShowingFarmers(t: TranslateFn, shown: number, total: number): string {
  return t("farmersPage.results.showingPattern")
    .replace("{shown}", String(shown))
    .replace("{total}", String(total));
}

export function formatSearchChip(t: TranslateFn, term: string): string {
  return t("farmersPage.results.searchChip").replace("{term}", term);
}

export function formatCategoryChip(t: TranslateFn, category: string): string {
  return translateFarmerCategory(t, category);
}

export function formatJobPay(t: TranslateFn, dailyPay: number): string {
  return t("farmerDetail.jobs.payPerDay").replace("{amount}", String(dailyPay));
}

export function formatLocalizedJobDateRange(
  language: Language,
  startDate: string,
  endDate: string,
): string {
  const locale = language === "az" ? "az-AZ" : "en-US";
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (language === "az") {
    const month = start.toLocaleDateString(locale, { month: "long" });
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${month}`;
    }
    const endMonth = end.toLocaleDateString(locale, { month: "long" });
    return `${start.getDate()} ${month} – ${end.getDate()} ${endMonth}`;
  }

  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString(locale, { month: "long" })} ${start.getDate()} – ${end.getDate()}`;
    }
    return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, yearOpts)}`;
  }

  return `${start.toLocaleDateString(locale, yearOpts)} – ${end.toLocaleDateString(locale, yearOpts)}`;
}

export const VERIFICATION_ITEM_KEYS = [
  "farmerDetail.verification.identityVerified",
  "farmerDetail.verification.farmLocationConfirmed",
  "farmerDetail.verification.productQualityChecked",
  "farmerDetail.verification.deliveryHandoffSupported",
] as const;
