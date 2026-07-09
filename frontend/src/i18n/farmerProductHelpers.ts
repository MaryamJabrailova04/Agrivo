import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import type {
  FarmerListingProduct,
  FarmerProductCategory,
  FarmerProductDisplayStatus,
} from "../app/utils/farmerProductsStorage";

type LocalizedName = { en: string; az: string };

const PRODUCT_NAME_MAP: Record<string, LocalizedName> = {
  tomato: { en: "Tomato", az: "Pomidor" },
  tomatoes: { en: "Tomatoes", az: "Pomidor" },
  pomidor: { en: "Tomato", az: "Pomidor" },
  pomegranate: { en: "Pomegranate", az: "Nar" },
  nar: { en: "Pomegranate", az: "Nar" },
  cucumber: { en: "Cucumber", az: "Xiyar" },
  cucumbers: { en: "Cucumbers", az: "Xiyar" },
  xiyar: { en: "Cucumber", az: "Xiyar" },
  apple: { en: "Apple", az: "Alma" },
  apples: { en: "Apples", az: "Alma" },
  alma: { en: "Apple", az: "Alma" },
  potato: { en: "Potato", az: "Kartof" },
  potatoes: { en: "Potatoes", az: "Kartof" },
  kartof: { en: "Potato", az: "Kartof" },
  carrot: { en: "Carrot", az: "Yerkökü" },
  carrots: { en: "Carrots", az: "Yerkökü" },
  cherry: { en: "Cherry", az: "Gilas" },
  cherries: { en: "Cherries", az: "Gilas" },
  gilas: { en: "Cherry", az: "Gilas" },
  watermelon: { en: "Watermelon", az: "Qarpız" },
  grape: { en: "Grape", az: "Üzüm" },
  grapes: { en: "Grapes", az: "Üzüm" },
  citrus: { en: "Citrus", az: "Sitrus" },
  pear: { en: "Pear", az: "Armud" },
  pears: { en: "Pears", az: "Armud" },
};

const PRODUCT_TRANSLATION_KEYS: Record<string, string> = {
  tomato: "products.tomato",
  tomatoes: "products.tomato",
  pomidor: "products.tomato",
  pomegranate: "products.pomegranate",
  nar: "products.pomegranate",
  cucumber: "products.cucumber",
  cucumbers: "products.cucumber",
  xiyar: "products.cucumber",
  apple: "products.apple",
  apples: "products.apple",
  alma: "products.apple",
  potato: "products.potato",
  potatoes: "products.potato",
  kartof: "products.potato",
  carrot: "products.carrot",
  carrots: "products.carrot",
  cherry: "products.cherry",
  cherries: "products.cherry",
  gilas: "products.cherry",
  watermelon: "products.watermelon",
  grape: "products.grape",
  grapes: "products.grape",
  pear: "products.pear",
  pears: "products.pear",
};

const CATEGORY_KEY_MAP: Record<string, string> = {
  Vegetables: "categories.vegetables",
  Fruits: "categories.fruits",
  "Dairy Products": "categories.dairyProducts",
  Dairy: "categories.dairy",
  Grains: "categories.grains",
  Herbs: "categories.herbs",
  Other: "categories.other",
};

const PRODUCT_KEY_BY_NORMALIZED: Record<string, string> = {
  tomato: "tomato",
  tomatoes: "tomato",
  pomidor: "tomato",
  cucumber: "cucumber",
  cucumbers: "cucumber",
  xiyar: "cucumber",
  potato: "potato",
  potatoes: "potato",
  kartof: "potato",
  carrot: "carrot",
  carrots: "carrot",
  cherry: "cherry",
  cherries: "cherry",
  gilas: "cherry",
  apple: "apple",
  apples: "apple",
  alma: "apple",
  pomegranate: "pomegranate",
  nar: "pomegranate",
  grape: "grape",
  grapes: "grape",
  watermelon: "watermelon",
  citrus: "citrus",
  milk: "milk",
  sud: "milk",
  cheese: "cheese",
  pendir: "cheese",
};

const PRODUCT_DICTIONARY: Record<string, LocalizedName> = {
  tomato: { en: "Tomato", az: "Pomidor" },
  cucumber: { en: "Cucumber", az: "Xiyar" },
  potato: { en: "Potato", az: "Kartof" },
  carrot: { en: "Carrot", az: "Yerkökü" },
  apple: { en: "Apple", az: "Alma" },
  cherry: { en: "Cherry", az: "Gilas" },
  pomegranate: { en: "Pomegranate", az: "Nar" },
  watermelon: { en: "Watermelon", az: "Qarpız" },
  grape: { en: "Grape", az: "Üzüm" },
  citrus: { en: "Citrus", az: "Sitrus" },
  milk: { en: "Milk", az: "Süd" },
  cheese: { en: "Cheese", az: "Pendir" },
};

const VARIETY_DICTIONARY: Record<string, LocalizedName> = {
  redtomato: { en: "Red Tomato", az: "Qırmızı Pomidor" },
  qirmizipomidor: { en: "Red Tomato", az: "Qırmızı Pomidor" },
  longcucumber: { en: "Long Cucumber", az: "Uzun Xiyar" },
  uzunxiyar: { en: "Long Cucumber", az: "Uzun Xiyar" },
  qizilahmedi: { en: "Qızıl Əhmədi", az: "Qızıl Əhmədi" },
  gizilahmadi: { en: "Qızıl Əhmədi", az: "Qızıl Əhmədi" },
  guloysha: { en: "Gülöyşə", az: "Gülöyşə" },
};

function normalizeProductKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function lookupProductKey(name: string, slug?: string): string | undefined {
  const candidates = [name, slug?.replace(/^api-/, "") ?? ""]
    .filter(Boolean)
    .flatMap((value) => {
      const raw = value.trim();
      const lower = raw.toLowerCase();
      const firstToken = lower.split(/[\s-_/]+/)[0] ?? lower;
      return [normalizeProductKey(raw), normalizeProductKey(firstToken), firstToken];
    });

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (PRODUCT_TRANSLATION_KEYS[candidate] || PRODUCT_NAME_MAP[candidate]) {
      return candidate;
    }
  }
  return undefined;
}

export function getLocalizedProductName(
  product: Pick<FarmerListingProduct, "name" | "slug"> & {
    nameKey?: string;
    nameLocalized?: LocalizedName;
  },
  language: Language,
  t: TranslateFn,
): string {
  if (product.nameLocalized?.[language]) {
    return product.nameLocalized[language];
  }

  if (product.nameKey) {
    return t(product.nameKey, product.name);
  }

  const key = lookupProductKey(product.name, product.slug);
  if (key) {
    const translationKey = PRODUCT_TRANSLATION_KEYS[key];
    if (translationKey) return t(translationKey, PRODUCT_NAME_MAP[key]?.[language] ?? product.name);
    const mapped = PRODUCT_NAME_MAP[key];
    if (mapped) return mapped[language] ?? mapped.en;
  }

  return product.name;
}

export function translateFarmerCategory(t: TranslateFn, category: string): string {
  const key = CATEGORY_KEY_MAP[category];
  return key ? t(key, category) : category;
}

export function translateFarmerProductStatus(
  t: TranslateFn,
  status: FarmerProductDisplayStatus | "Low stock",
): string {
  if (status === "Active") return t("farmerProducts.status.active");
  if (status === "Inactive") return t("farmerProducts.status.inactive");
  if (status === "Draft") return t("farmerProducts.status.draft");
  if (status === "Low Stock" || status === "Low stock") return t("farmerProducts.status.lowStockBadge");
  if (status === "Out of Stock") return t("farmerProducts.status.outOfStock");
  return status;
}

export function translateHarvestLabel(t: TranslateFn, harvestDate: string): string {
  const value = harvestDate.trim();
  const lower = value.toLowerCase();

  if (lower === "this week") return t("farmerProducts.harvest.thisWeek");
  if (lower === "today") return t("farmerProducts.harvest.today");
  if (lower === "yesterday") return t("farmerProducts.harvest.yesterday");
  if (lower === "last week") return t("farmerProducts.harvest.lastWeek");
  if (lower === "next week") return t("farmerProducts.harvest.nextWeek");

  const daysAgo = value.match(/^(\d+)\s+days?\s+ago$/i);
  if (daysAgo) {
    return t("farmerProducts.harvest.daysAgo", { count: Number(daysAgo[1]) });
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  return harvestDate;
}

export function translateLocationDetail(t: TranslateFn, detail: string): string {
  const map: Record<string, string> = {
    Greenhouse: "farmerProducts.locationDetails.greenhouse",
    "Open field": "farmerProducts.locationDetails.openField",
    Orchard: "farmerProducts.locationDetails.orchard",
    "Root fields": "farmerProducts.locationDetails.rootFields",
    Farm: "farmerProducts.locationDetails.farm",
  };
  const key = map[detail];
  return key ? t(key) : detail;
}

export function resolveKnownProductName(inputName: string, language: Language): string {
  const key = lookupProductKey(inputName);
  if (!key) return inputName.trim();
  return PRODUCT_NAME_MAP[key]?.[language] ?? inputName.trim();
}

export function resolveProductKey(inputName: string): string | null {
  const normalized = normalizeProductKey(inputName);
  return PRODUCT_KEY_BY_NORMALIZED[normalized] ?? null;
}

export function resolveLocalizedName(
  inputName: string,
  key?: string | null,
): LocalizedName | undefined {
  const resolvedKey = key ?? resolveProductKey(inputName);
  return resolvedKey ? PRODUCT_DICTIONARY[resolvedKey] : undefined;
}

export function resolveVarietyKey(variety: string): string | null {
  const normalized = normalizeProductKey(variety);
  return VARIETY_DICTIONARY[normalized] ? normalized : null;
}

export function resolveLocalizedVariety(
  variety: string,
  key?: string | null,
): LocalizedName | undefined {
  const resolvedKey = key ?? resolveVarietyKey(variety);
  return resolvedKey ? VARIETY_DICTIONARY[resolvedKey] : undefined;
}

export function getLocalizedVariety(
  product: Pick<FarmerListingProduct, "variety"> & {
    varietyLocalized?: LocalizedName;
    varietyKey?: string;
  },
  language: Language,
): string | undefined {
  if (!product.variety) return undefined;
  if (product.varietyLocalized?.[language]) return product.varietyLocalized[language];
  const localized = resolveLocalizedVariety(product.variety, product.varietyKey);
  return localized?.[language] ?? product.variety;
}

export function translateDeliveryOption(t: TranslateFn, option: string): string {
  if (option === "Farmer delivery") return t("farmerAddProduct.deliveryOptions.farmerDelivery");
  if (option === "Buyer pickup") return t("farmerAddProduct.deliveryOptions.buyerPickup");
  if (option === "Logistics partner") return t("farmerAddProduct.deliveryOptions.logisticsPartner");
  return option;
}

export function translateUnitLabel(t: TranslateFn, unit: string): string {
  if (unit === "kg") return t("farmerAddProduct.units.kg");
  if (unit === "ton") return t("farmerAddProduct.units.ton");
  if (unit === "liter") return t("farmerAddProduct.units.liter");
  if (unit === "piece") return t("farmerAddProduct.units.piece");
  if (unit === "box") return t("farmerAddProduct.units.box");
  return unit;
}

export type FarmerCategoryOption = FarmerProductCategory | "all";
