import type { HarvestListing } from "../app/data/harvestExplorer";
import type { EconomicRegion } from "../app/data/azerbaijanRegions";
import type { TranslateFn } from "./LanguageContext";
import {
  translateLandingCategory,
  translateLandingProductName,
} from "./landingHelpers";

const CHIP_KEYS: Record<string, string> = {
  Tomato: "marketplace.chips.tomato",
  Apple: "marketplace.chips.apple",
  Potato: "marketplace.chips.potato",
  Pomegranate: "marketplace.chips.pomegranate",
  Cucumber: "marketplace.chips.cucumber",
  Grapes: "marketplace.chips.grapes",
  Citrus: "marketplace.chips.citrus",
  Watermelon: "marketplace.chips.watermelon",
};

const PRODUCT_TYPE_KEYS: Record<string, string> = {
  Tomato: "marketplace.products.tomato",
  Apple: "marketplace.products.apple",
  Potato: "marketplace.products.potato",
  Pomegranate: "marketplace.products.pomegranate",
  Cucumber: "marketplace.products.cucumber",
  Grapes: "marketplace.products.grapes",
  Citrus: "marketplace.products.citrus",
  Watermelon: "marketplace.products.watermelon",
  Vegetables: "marketplace.products.mixedVegetables",
  Fruits: "marketplace.products.fruits",
  Onion: "marketplace.products.onion",
  Pepper: "marketplace.products.pepper",
  Eggplant: "marketplace.products.eggplant",
  Pear: "marketplace.products.pear",
  Cherry: "marketplace.products.cherry",
  Melon: "marketplace.products.melon",
  Greenhouse: "marketplace.products.greenhouse",
};

const LISTING_NAME_KEYS: Record<string, string> = {
  "Fresh Tomatoes": "landing.productNames.tomatoes",
  "Red Apples": "landing.productNames.redApples",
  "Table Potatoes": "landing.productNames.potatoes",
  Pomegranate: "marketplace.products.pomegranate",
  "Green Cucumbers": "landing.productNames.cucumbers",
  "Table Grapes": "marketplace.products.grapes",
  "Citrus Fruits": "landing.productNames.citrusFruits",
  Watermelon: "landing.productNames.watermelon",
  "Mixed Vegetables": "landing.productNames.mixedVegetables",
  "Seasonal Fruits": "marketplace.products.fruits",
  "Yellow Onions": "marketplace.products.onion",
  "Bell Peppers": "marketplace.products.pepper",
  Eggplants: "marketplace.products.eggplant",
  "Summer Pears": "marketplace.products.pear",
  "Sweet Cherries": "landing.productNames.cherries",
  Melon: "marketplace.products.melon",
  "Greenhouse Produce": "marketplace.products.greenhouse",
  Tomatoes: "landing.productNames.tomatoes",
  Cucumbers: "landing.productNames.cucumbers",
  Apples: "landing.productNames.apples",
  Potatoes: "landing.productNames.potatoes",
  Carrots: "landing.productNames.carrots",
  Cherries: "landing.productNames.cherries",
};

const HARVEST_DATE_KEYS: Record<string, string> = {
  Today: "marketplace.statuses.today",
  Yesterday: "marketplace.statuses.yesterday",
  "2 days ago": "marketplace.statuses.twoDaysAgo",
  "3 days ago": "marketplace.statuses.threeDaysAgo",
  "This week": "marketplace.statuses.thisWeek",
};

const TAG_KEYS: Record<string, string> = {
  "Verified farmer": "marketplace.statuses.verifiedFarmer",
  Greenhouse: "marketplace.card.greenhouse",
  "Open field": "marketplace.card.openField",
  Organic: "marketplace.card.organic",
  "Delivery available": "marketplace.statuses.deliveryAvailable",
  Seasonal: "marketplace.statuses.seasonal",
  Fresh: "marketplace.card.fresh",
  "Available now": "marketplace.card.availableNow",
  "Pre-order": "marketplace.card.preorder",
};

const VARIETY_KEYS: Record<string, string> = {
  "Qirmizi Pomido": "marketplace.varieties.qirmiziPomidor",
  "Qırmızı Pomidor": "marketplace.varieties.qirmiziPomidor",
  Gülöyşə: "marketplace.varieties.guloysha",
  "Qara Gilas": "marketplace.varieties.qaraGilas",
  "Yerli Kök": "marketplace.varieties.yerliKok",
  "Qızıl Əhmədi": "marketplace.varieties.qizilAhmadi",
  "Uzun Xiyar": "marketplace.varieties.uzunXiyar",
  "Çerri Pomidor": "marketplace.varieties.cerriPomidor",
  "Gədəbəy Kartofu": "marketplace.varieties.gadabayKartofu",
};

const REGION_SUMMARY_KEYS: Partial<Record<EconomicRegion, string>> = {
  "Quba-Xaçmaz": "marketplace.regionSummaries.qubaXachmaz",
  "Mərkəzi Aran": "marketplace.regionSummaries.merkeziAran",
  "Lənkəran-Astara": "marketplace.regionSummaries.lankaranAstara",
  "Qazax-Tovuz": "marketplace.regionSummaries.qazaxTovuz",
  "Gəncə-Daşkəsən": "marketplace.regionSummaries.genceDashkesen",
  "Şəki-Zaqatala": "marketplace.regionSummaries.sekiZaqatala",
  Bakı: "marketplace.regionSummaries.baki",
  "Mil-Muğan": "marketplace.regionSummaries.milMugan",
};

export const VERIFIED_FARMER_TAG = "Verified farmer";
const VARIETY_TAG_PREFIX = "Variety: ";

function lookup(t: TranslateFn, map: Record<string, string>, value: string): string {
  const key = map[value];
  return key ? t(key, value) : value;
}

export function translateProductChip(t: TranslateFn, chip: string): string {
  return lookup(t, CHIP_KEYS, chip);
}

export function translateProductType(t: TranslateFn, productType: string): string {
  return lookup(t, PRODUCT_TYPE_KEYS, productType);
}

export function translateCategoryFilter(t: TranslateFn, value: string): string {
  if (value === "all") return t("marketplace.filters.allCategories");
  if (value === "Fruits") return t("marketplace.categories.fruits");
  if (value === "Vegetables") return t("marketplace.categories.vegetables");
  return translateProductChip(t, value);
}

export function translateListingName(
  t: TranslateFn,
  name: string,
  productType?: string,
): string {
  const fromMap = lookup(t, LISTING_NAME_KEYS, name);
  if (fromMap !== name) return fromMap;

  const fromLanding = translateLandingProductName(t, name);
  if (fromLanding !== name) return fromLanding;

  if (name.startsWith("Fresh ")) {
    const type = name.slice(6);
    const translated = translateProductType(t, type);
    if (translated !== type) {
      return `${t("marketplace.card.fresh")} ${translated}`;
    }
  }

  if (productType) {
    const translatedType = translateProductType(t, productType);
    if (translatedType !== productType) return translatedType;
  }

  return name;
}

export function translateTag(t: TranslateFn, tag: string): string {
  if (tag.startsWith(VARIETY_TAG_PREFIX)) {
    const variety = tag.slice(VARIETY_TAG_PREFIX.length);
    return `${t("marketplace.card.variety")}: ${translateVariety(t, variety)}`;
  }
  return lookup(t, TAG_KEYS, tag);
}

export function translateHarvestDate(t: TranslateFn, date: string): string {
  return lookup(t, HARVEST_DATE_KEYS, date);
}

export function translateVariety(t: TranslateFn, variety: string): string {
  return lookup(t, VARIETY_KEYS, variety);
}

export function translateRegionSummary(t: TranslateFn, region: EconomicRegion, fallback: string): string {
  const key = REGION_SUMMARY_KEYS[region];
  if (key) return t(key, fallback);
  if (fallback.startsWith("Known for ")) {
    return t("marketplace.regionSummaries.knownFor", fallback);
  }
  return t("marketplace.regionSummaries.default", fallback);
}

export function formatInsightHighlight(t: TranslateFn, count: number, productType: string): string {
  const normalized =
    Object.keys(PRODUCT_TYPE_KEYS).find(
      (key) => key.toLowerCase() === productType.toLowerCase(),
    ) ?? productType;
  const product = translateProductType(t, normalized).toLowerCase();
  return t("marketplace.listings.insightHighlight")
    .replace("{count}", String(count))
    .replace("{product}", product);
}

export function formatListingCount(t: TranslateFn, count: number): string {
  const label =
    count === 1 ? t("marketplace.listingSingular") : t("marketplace.listingsLabel");
  return `${count} ${label}`;
}

export function formatShowingCount(t: TranslateFn, shown: number, total: number): string {
  return t("marketplace.listings.showingPattern")
    .replace("{shown}", String(shown))
    .replace("{total}", String(total));
}

export function formatMoreListings(t: TranslateFn, count: number): string {
  return t("marketplace.listings.moreListings").replace("{count}", String(count));
}

export function formatQuickStatsSubtitle(
  t: TranslateFn,
  listings: number,
  farmers: number,
  deliveryCount: number,
): string {
  return t("marketplace.listings.regionStats")
    .replace("{listings}", String(listings))
    .replace("{farmers}", String(farmers))
    .replace("{delivery}", String(deliveryCount));
}

export function formatAvailableIn(t: TranslateFn, place: string): string {
  return t("marketplace.listings.availableIn").replace("{place}", place);
}

export function formatAllListingsIn(t: TranslateFn, place: string): string {
  return t("marketplace.listings.allIn").replace("{place}", place);
}

export function formatViewAllDistrictsIn(t: TranslateFn, region: string): string {
  return t("marketplace.districts.viewAllIn").replace("{region}", region);
}

export function formatSelectedRegion(t: TranslateFn, region: string): string {
  return t("marketplace.map.selectedRegion").replace("{region}", region);
}

export function formatMapTooltipListings(t: TranslateFn, count: number): string {
  return t("marketplace.map.tooltipListings").replace("{count}", String(count));
}

export function formatMapTooltipFarmers(t: TranslateFn, count: number): string {
  return t("marketplace.map.tooltipFarmers").replace("{count}", String(count));
}

export function localizeHarvestListing(t: TranslateFn, listing: HarvestListing): HarvestListing {
  return {
    ...listing,
    name: translateListingName(t, listing.name, listing.productType),
    variety: listing.variety ? translateVariety(t, listing.variety) : listing.variety,
    harvestDate: translateHarvestDate(t, listing.harvestDate),
    tags: listing.tags.map((tag) => translateTag(t, tag)),
    category: listing.category ? translateLandingCategory(t, listing.category) : listing.category,
  };
}

export function translateTopProductsList(t: TranslateFn, products: string[]): string {
  return products.map((product) => translateProductType(t, product)).join(", ");
}
