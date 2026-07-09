import type { TranslateFn } from "./LanguageContext";

const CATEGORY_KEYS: Record<string, string> = {
  Vegetables: "landing.categories.vegetables",
  Fruits: "landing.categories.fruits",
  "Dairy Products": "landing.categories.dairyProducts",
  Tomatoes: "landing.categories.tomatoes",
  Cucumbers: "landing.categories.cucumbers",
  Apples: "landing.categories.apples",
  Pears: "landing.categories.pears",
  Milk: "landing.categories.milk",
  Cheese: "landing.categories.cheese",
  Potatoes: "landing.productNames.potatoes",
  Carrots: "landing.productNames.carrots",
  Cherries: "landing.productNames.cherries",
};

const BADGE_KEYS: Record<string, string> = {
  "Open Field": "landing.badges.openField",
  Fresh: "landing.badges.fresh",
  Organic: "landing.badges.organic",
};

const TAG_KEYS: Record<string, string> = {
  "Delivery available": "landing.tags.deliveryAvailable",
  "Verified farmer": "landing.tags.verifiedFarmer",
};

const PRODUCT_NAME_KEYS: Record<string, string> = {
  Potatoes: "landing.productNames.potatoes",
  Carrots: "landing.productNames.carrots",
  Cherries: "landing.productNames.cherries",
  Apples: "landing.productNames.apples",
  Tomatoes: "landing.productNames.tomatoes",
  Cucumbers: "landing.productNames.cucumbers",
  Watermelon: "landing.productNames.watermelon",
  "Mixed Vegetables": "landing.productNames.mixedVegetables",
  "Citrus Fruits": "landing.productNames.citrusFruits",
  "Red Apples": "landing.productNames.redApples",
};

function lookup(t: TranslateFn, map: Record<string, string>, value: string): string {
  const key = map[value];
  return key ? t(key, value) : value;
}

export function translateLandingCategory(t: TranslateFn, value: string): string {
  return lookup(t, CATEGORY_KEYS, value);
}

export function translateLandingBadge(t: TranslateFn, value: string): string {
  return lookup(t, BADGE_KEYS, value);
}

export function translateLandingTag(t: TranslateFn, value: string): string {
  return lookup(t, TAG_KEYS, value);
}

export function translateLandingProductName(t: TranslateFn, value: string): string {
  return lookup(t, PRODUCT_NAME_KEYS, value);
}

export function translateLandingExperience(t: TranslateFn, experience: string): string {
  const match = experience.match(/^(\d+)\s*years?$/i);
  if (match) {
    return `${match[1]} ${t("landing.farmers.years")}`;
  }
  return experience;
}

export function formatLandingPrice(t: TranslateFn, amount: string): string {
  return `${amount} ${t("landing.products.priceUnit")}`;
}
