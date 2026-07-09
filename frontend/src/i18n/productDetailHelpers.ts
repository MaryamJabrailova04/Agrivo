import type { MarketplaceProductDetail } from "../app/data/marketplaceProducts";
import type { TranslateFn } from "./LanguageContext";
import {
  localizeHarvestListing,
  translateHarvestDate,
  translateProductType,
  translateTag,
  translateVariety,
} from "./marketplaceHelpers";
import {
  translateLandingCategory,
  translateLandingProductName,
} from "./landingHelpers";

const FRESHNESS_KEYS: Record<string, string> = {
  harvestedToday: "productDetail.details.harvestedToday",
  recentlyHarvested: "productDetail.details.recentlyHarvested",
};

const STORAGE_KEYS: Record<string, string> = {
  keepCoolDry: "productDetail.details.keepCoolDry",
  storeCoolPlace: "productDetail.details.storeCoolPlace",
};

const DELIVERY_ESTIMATE_KEYS: Record<string, string> = {
  oneTwoDays: "productDetail.delivery.oneTwoDays",
  pickupOnly: "product.pickupOnly",
};

const LOGISTICS_KEYS: Record<string, string> = {
  availableThroughAgrivo: "productDetail.delivery.availableThroughAgrivo",
  pickupCoordinationOnly: "productDetail.delivery.pickupCoordinationOnly",
};

const DESCRIPTION_KEYS: Record<string, string> = {
  "Vine-ripened Lankaran tomatoes with firm texture and rich flavor.":
    "productDetail.descriptions.lankaranTomatoes",
  "Crisp cucumbers packed fresh for restaurants and local buyers.":
    "productDetail.descriptions.cucumbers",
  "Hand-picked orchard apples sorted for retail and food service.":
    "productDetail.descriptions.orchardApples",
  "Sweet Quba pears with careful grading and farm-direct pricing.":
    "productDetail.descriptions.qubaPears",
  "Fresh farm milk collected daily and prepared for market delivery.":
    "productDetail.descriptions.farmMilk",
  "Locally crafted cheese with a smooth texture and rich dairy flavor.":
    "productDetail.descriptions.localCheese",
  "Clean, firm potatoes sorted for market and kitchen supply.":
    "productDetail.descriptions.marketPotatoes",
  "Sweet carrots harvested fresh for direct buyer delivery.":
    "productDetail.descriptions.freshCarrots",
  "Daily collected milk prepared for chilled urban delivery.":
    "productDetail.descriptions.chilledMilk",
  "Creamy yogurt produced in small batches for retail partners.":
    "productDetail.descriptions.batchYogurt",
  "Hand-picked cherries with careful sorting for premium buyers.":
    "productDetail.descriptions.premiumCherries",
  "Crisp orchard apples packed for farm-to-market orders.":
    "productDetail.descriptions.packedApples",
};

const SPECIALTY_KEYS: Record<string, string> = {
  Yogurt: "productDetail.specialties.yogurt",
  "Fresh Milk": "productDetail.specialties.freshMilk",
};

function lookup(t: TranslateFn, map: Record<string, string>, value: string): string {
  const key = map[value];
  return key ? t(key, value) : value;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function translateFreshnessStatus(t: TranslateFn, key: string): string {
  return lookup(t, FRESHNESS_KEYS, key);
}

export function translateStorageNote(t: TranslateFn, key: string): string {
  return lookup(t, STORAGE_KEYS, key);
}

export function translateEstimatedDelivery(t: TranslateFn, key: string): string {
  return lookup(t, DELIVERY_ESTIMATE_KEYS, key);
}

export function translateLogisticsSupport(t: TranslateFn, key: string): string {
  return lookup(t, LOGISTICS_KEYS, key);
}

export function translateProductDescription(
  t: TranslateFn,
  description: string,
  productType?: string,
): string {
  const fromMap = lookup(t, DESCRIPTION_KEYS, description);
  if (fromMap !== description) return fromMap;

  const traceableMatch = description.match(
    /^Fresh ([a-z]+) from (.+), listed on Agrivo with regional traceability\.$/i,
  );
  if (traceableMatch) {
    const product = translateProductType(t, capitalize(traceableMatch[1])).toLowerCase();
    return t("productDetail.descriptions.genericTraceable")
      .replace("{product}", product)
      .replace("{district}", traceableMatch[2]);
  }

  if (productType) {
    return t("productDetail.descriptions.genericFresh");
  }

  return description;
}

export function translateSpecialization(t: TranslateFn, specialization: string): string {
  return specialization
    .split(", ")
    .map((item) => {
      const trimmed = item.trim();
      const fromSpecialty = lookup(t, SPECIALTY_KEYS, trimmed);
      if (fromSpecialty !== trimmed) return fromSpecialty;

      const fromCategory = translateLandingCategory(t, trimmed);
      if (fromCategory !== trimmed) return fromCategory;

      const fromProduct = translateLandingProductName(t, trimmed);
      if (fromProduct !== trimmed) return fromProduct;

      return trimmed;
    })
    .join(", ");
}

export interface LocalizedProductDetail {
  name: string;
  variety?: string;
  badge: string;
  harvestDate: string;
  freshnessStatus: string;
  storageNote: string;
  estimatedDelivery: string;
  logisticsSupport: string;
  category: string;
  description?: string;
  farmerSpecialization: string;
  deliveryAvailableLabel: string;
  deliveryYesNo: string;
  pickupAvailableLabel: string;
}

export function localizeProductDetail(
  t: TranslateFn,
  product: MarketplaceProductDetail,
): LocalizedProductDetail {
  const listing = localizeHarvestListing(t, product);

  return {
    name: listing.name,
    variety: product.variety ? translateVariety(t, product.variety) : undefined,
    badge: translateTag(t, product.badge),
    harvestDate: translateHarvestDate(t, product.harvestDate),
    freshnessStatus: translateFreshnessStatus(t, product.freshnessStatus),
    storageNote: translateStorageNote(t, product.storageNote),
    estimatedDelivery: translateEstimatedDelivery(t, product.estimatedDelivery),
    logisticsSupport: translateLogisticsSupport(t, product.logisticsSupport),
    category: product.category
      ? translateLandingCategory(t, product.category)
      : t("productDetail.details.produce"),
    description: product.description
      ? translateProductDescription(t, product.description, product.productType)
      : undefined,
    farmerSpecialization: translateSpecialization(t, product.farmerSpecialization),
    deliveryAvailableLabel: product.deliveryAvailable
      ? t("product.deliveryAvailable")
      : t("product.pickupOnly"),
    deliveryYesNo: product.deliveryAvailable
      ? t("productDetail.delivery.yes")
      : t("productDetail.delivery.no"),
    pickupAvailableLabel: product.pickupAvailable
      ? t("productDetail.delivery.available")
      : t("productDetail.delivery.notAvailable"),
  };
}

export function formatCartSummary(t: TranslateFn, count: number): string {
  const label = count === 1 ? t("productDetail.cart.item") : t("productDetail.cart.items");
  return t("productDetail.cart.summary")
    .replace("{count}", String(count))
    .replace("{label}", label);
}

export function formatLogisticsHandoff(t: TranslateFn, deliveryEstimate: string): string {
  return t("productDetail.logisticsCard.estimatedHandoff").replace("{delivery}", deliveryEstimate);
}
