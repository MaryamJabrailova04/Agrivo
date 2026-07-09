import type { AuthUser } from "../auth/authStorage";
import { getProductImage } from "./productImages";
import {
  resolveLocalizedName,
  resolveLocalizedVariety,
  resolveProductKey,
  resolveVarietyKey,
} from "../../i18n/farmerProductHelpers";

export type FarmerProductCategory =
  | "Vegetables"
  | "Fruits"
  | "Dairy Products"
  | "Grains"
  | "Herbs"
  | "Other";

export type ProductFormCategory = "Fruits" | "Vegetables" | "Dairy" | "Grains" | "Herbs" | "Other";

export type FarmerDeliveryOption = "Farmer delivery" | "Buyer pickup" | "Logistics partner";

export type ProductFormTag = "Fresh" | "Organic" | "Available Now";

export type FarmerListingStatus = "active" | "draft" | "inactive";

export type FarmerProductDisplayStatus =
  | "Active"
  | "Low Stock"
  | "Draft"
  | "Inactive"
  | "Out of Stock";

export interface FarmerListingProduct {
  id: string;
  slug: string;
  name: string;
  nameKey?: string;
  nameLocalized?: { en: string; az: string };
  variety?: string;
  varietyKey?: string;
  varietyLocalized?: { en: string; az: string };
  category: FarmerProductCategory;
  categoryKey?: "vegetables" | "fruits" | "dairy" | "grains" | "herbs" | "other";
  image: string;
  price: number;
  unit: string;
  unitKey?: "kg" | "ton" | "box" | "piece" | "liter";
  availableQuantity: number;
  minimumOrder: number;
  harvestDate: string;
  listingStatus: FarmerListingStatus;
  deliveryAvailable: boolean;
  description: string;
  location: string;
  locationDetail: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  lowStockThreshold: number;
  region?: string;
  district?: string;
  productTags?: ProductFormTag[];
  deliveryOption?: FarmerDeliveryOption;
  deliveryOptionKey?: "farmerDelivery" | "buyerPickup" | "logisticsPartner";
}

export interface FarmerProductsSummary {
  activeListings: number;
  totalStockKg: number;
  lowStock: number;
  draftInactive: number;
  weekSalesKg: number;
  totalProducts: number;
  draftProducts: number;
}

export interface CreateFarmerProductInput {
  name: string;
  variety?: string;
  category: ProductFormCategory;
  region: string;
  district: string;
  price: number;
  quantity: number;
  unit: string;
  harvestDate: string;
  image: string;
  description: string;
  tags: ProductFormTag[];
  deliveryOption: FarmerDeliveryOption;
  listingStatus: FarmerListingStatus;
}

function mapFormCategory(category: ProductFormCategory): FarmerProductCategory {
  if (category === "Dairy") return "Dairy Products";
  return category;
}

export const mapProductFormCategory = mapFormCategory;

export function mapFarmerCategoryToForm(category: FarmerProductCategory): ProductFormCategory {
  if (category === "Dairy Products") return "Dairy";
  if (
    category === "Fruits" ||
    category === "Vegetables" ||
    category === "Grains" ||
    category === "Herbs" ||
    category === "Other"
  ) {
    return category;
  }
  return "Other";
}

function uniqueSlug(name: string, district: string, products: FarmerListingProduct[]): string {
  const base = slugify(name, district);
  let slug = base;
  let attempt = 1;
  const used = new Set(products.map((p) => p.slug));
  while (used.has(slug)) {
    slug = `${base}-${attempt++}`;
  }
  return slug;
}

const STORAGE_KEY_PREFIX = "agrivo_farmer_products_";
const LOW_STOCK_DEFAULT = 20;

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function generateId(): string {
  return `fp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(name: string, location: string): string {
  return `${name}-${location}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveFarmerProductsUserId(user: AuthUser): string {
  return user.id || "demo_farmer";
}

export function getDisplayStatus(product: FarmerListingProduct): FarmerProductDisplayStatus {
  if (product.archived) return "Inactive";
  if (product.listingStatus === "draft") return "Draft";
  if (product.listingStatus === "inactive") return "Inactive";
  if (product.availableQuantity <= 0) return "Out of Stock";
  if (product.availableQuantity <= product.lowStockThreshold) return "Low Stock";
  return "Active";
}

function defaultProducts(): FarmerListingProduct[] {
  const now = new Date().toISOString();
  const base = (partial: Omit<FarmerListingProduct, "id" | "createdAt" | "updatedAt" | "archived" | "lowStockThreshold">): FarmerListingProduct => ({
    ...partial,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    archived: false,
    lowStockThreshold: LOW_STOCK_DEFAULT,
  });

  return [
    base({
      slug: slugify("Tomatoes", "quba"),
      name: "Tomato",
      variety: "Zirə Pomidoru",
      category: "Vegetables",
      image: getProductImage("Tomato"),
      price: 2.5,
      unit: "kg",
      availableQuantity: 120,
      minimumOrder: 20,
      harvestDate: "This week",
      listingStatus: "active",
      deliveryAvailable: true,
      description: "Greenhouse tomatoes sorted for retail and restaurant supply.",
      location: "Quba",
      locationDetail: "Greenhouse",
    }),
    base({
      slug: slugify("Cucumbers", "lankaran"),
      name: "Cucumber",
      variety: "Kornişon",
      category: "Vegetables",
      image: getProductImage("Cucumber"),
      price: 1.8,
      unit: "kg",
      availableQuantity: 90,
      minimumOrder: 20,
      harvestDate: "This week",
      listingStatus: "active",
      deliveryAvailable: true,
      description: "Fresh field cucumbers packed for same-week delivery.",
      location: "Lənkəran",
      locationDetail: "Open field",
    }),
    base({
      slug: slugify("Apples", "quba"),
      name: "Apple",
      variety: "Qızıl Əhmədi",
      category: "Fruits",
      image: getProductImage("Apple"),
      price: 1.7,
      unit: "kg",
      availableQuantity: 175,
      minimumOrder: 25,
      harvestDate: "3 days ago",
      listingStatus: "active",
      deliveryAvailable: true,
      description: "Crisp orchard apples graded for marketplace buyers.",
      location: "Quba",
      locationDetail: "Orchard",
    }),
    base({
      slug: slugify("Cherries", "quba"),
      name: "Cherry",
      variety: "Napoleon",
      category: "Fruits",
      image: getProductImage("Cherry"),
      price: 3.4,
      unit: "kg",
      availableQuantity: 12,
      minimumOrder: 5,
      harvestDate: "Yesterday",
      listingStatus: "active",
      deliveryAvailable: true,
      description: "Sweet seasonal cherries — limited remaining stock.",
      location: "Quba",
      locationDetail: "Orchard",
    }),
    base({
      slug: slugify("Pears", "sheki"),
      name: "Pear",
      variety: "Nar Armudu",
      category: "Fruits",
      image: getProductImage("Pear"),
      price: 1.6,
      unit: "kg",
      availableQuantity: 0,
      minimumOrder: 25,
      harvestDate: "Last week",
      listingStatus: "active",
      deliveryAvailable: false,
      description: "Aromatic Şəki pears — restock expected soon.",
      location: "Şəki",
      locationDetail: "Orchard",
    }),
    base({
      slug: slugify("Potatoes", "ganja"),
      name: "Potato",
      variety: "Gədəbəy Kartofu",
      category: "Vegetables",
      image: getProductImage("Potato"),
      price: 0.9,
      unit: "kg",
      availableQuantity: 200,
      minimumOrder: 50,
      harvestDate: "Next week",
      listingStatus: "draft",
      deliveryAvailable: true,
      description: "Draft listing for autumn potato harvest.",
      location: "Gəncə",
      locationDetail: "Root fields",
    }),
  ];
}

export function getFarmerProducts(userId: string): FarmerListingProduct[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      const defaults = defaultProducts();
      setFarmerProducts(userId, defaults);
      return defaults;
    }
    return JSON.parse(raw) as FarmerListingProduct[];
  } catch {
    const defaults = defaultProducts();
    setFarmerProducts(userId, defaults);
    return defaults;
  }
}

export function setFarmerProducts(userId: string, products: FarmerListingProduct[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(products));
}

export function updateFarmerProduct(
  userId: string,
  productId: string,
  updates: Partial<FarmerListingProduct>,
): FarmerListingProduct[] {
  const products = getFarmerProducts(userId);
  const next = products.map((item) =>
    item.id === productId
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item,
  );
  setFarmerProducts(userId, next);
  return next;
}

export function archiveFarmerProduct(userId: string, productId: string): FarmerListingProduct[] {
  return updateFarmerProduct(userId, productId, { archived: true, listingStatus: "inactive" });
}

export function computeProductsSummary(products: FarmerListingProduct[]): FarmerProductsSummary {
  const visible = products.filter((p) => !p.archived);
  const activeListings = visible.filter(
    (p) => p.listingStatus === "active" && getDisplayStatus(p) !== "Out of Stock",
  ).length;
  const totalStockKg = visible.reduce((sum, p) => sum + p.availableQuantity, 0);
  const lowStock = visible.filter((p) => getDisplayStatus(p) === "Low Stock").length;
  const draftInactive = visible.filter(
    (p) => p.listingStatus === "draft" || p.listingStatus === "inactive",
  ).length;

  return {
    activeListings,
    totalStockKg,
    lowStock,
    draftInactive,
    weekSalesKg: 180,
    totalProducts: visible.length,
    draftProducts: visible.filter((p) => p.listingStatus === "draft").length,
  };
}

export function addFarmerProduct(
  userId: string,
  input: CreateFarmerProductInput,
): FarmerListingProduct[] {
  const products = getFarmerProducts(userId);
  const now = new Date().toISOString();
  const locationLabel = input.district.replace(/ rayonu| şəhəri/g, "").trim();
  const nameKey = resolveProductKey(input.name);
  const nameLocalized = resolveLocalizedName(input.name, nameKey);
  const varietyKey = input.variety ? resolveVarietyKey(input.variety) : null;
  const varietyLocalized = input.variety ? resolveLocalizedVariety(input.variety, varietyKey) : undefined;
  const categoryKey =
    input.category === "Vegetables"
      ? "vegetables"
      : input.category === "Fruits"
        ? "fruits"
        : input.category === "Dairy"
          ? "dairy"
          : input.category === "Grains"
            ? "grains"
            : input.category === "Herbs"
              ? "herbs"
              : "other";
  const deliveryOptionKey =
    input.deliveryOption === "Farmer delivery"
      ? "farmerDelivery"
      : input.deliveryOption === "Buyer pickup"
        ? "buyerPickup"
        : "logisticsPartner";

  const product: FarmerListingProduct = {
    id: generateId(),
    slug: uniqueSlug(input.name, input.district, products),
    name: input.name.trim(),
    nameKey: nameKey ?? undefined,
    nameLocalized,
    variety: input.variety?.trim() || undefined,
    varietyKey: varietyKey ?? undefined,
    varietyLocalized,
    category: mapFormCategory(input.category),
    categoryKey,
    image: input.image,
    price: input.price,
    unit: input.unit,
    unitKey: input.unit as FarmerListingProduct["unitKey"],
    availableQuantity: input.quantity,
    minimumOrder: input.unit === "kg" ? 20 : input.unit === "ton" ? 1 : 5,
    harvestDate: input.harvestDate,
    listingStatus: input.listingStatus,
    deliveryAvailable: input.deliveryOption !== "Buyer pickup",
    description: input.description.trim(),
    location: locationLabel,
    locationDetail: input.region,
    region: input.region,
    district: input.district,
    productTags: input.tags,
    deliveryOption: input.deliveryOption,
    deliveryOptionKey,
    createdAt: now,
    updatedAt: now,
    archived: false,
    lowStockThreshold: LOW_STOCK_DEFAULT,
  };

  const next = [...products, product];
  setFarmerProducts(userId, next);
  return next;
}

export type ProductSortOption = "newest" | "name" | "price-asc" | "stock-asc";

export function filterAndSortProducts(
  products: FarmerListingProduct[],
  options: {
    search: string;
    category: FarmerProductCategory | "all";
    status: FarmerProductDisplayStatus | "all" | "Low stock";
    sort: ProductSortOption;
  },
): FarmerListingProduct[] {
  const query = options.search.trim().toLowerCase();

  let result = products.filter((p) => !p.archived);

  if (query) {
    const productAliases: Record<string, string[]> = {
      tomato: ["tomato", "tomatoes", "pomidor"],
      cucumber: ["cucumber", "cucumbers", "xiyar"],
      apple: ["apple", "apples", "alma"],
      potato: ["potato", "potatoes", "kartof"],
      carrot: ["carrot", "carrots", "yerkökü", "yerkoku"],
      cherry: ["cherry", "cherries", "gilas"],
      pomegranate: ["pomegranate", "nar"],
      watermelon: ["watermelon", "qarpız", "qarpiz"],
      grape: ["grape", "grapes", "üzüm", "uzum"],
      pear: ["pear", "pears", "armud"],
    };

    result = result.filter((p) => {
      const haystack = [
        p.name,
        p.variety ?? "",
        p.location,
        p.category,
        p.locationDetail,
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(query)) return true;

      const normalizedName = p.name.trim().toLowerCase();
      for (const aliases of Object.values(productAliases)) {
        if (aliases.includes(normalizedName) || aliases.some((alias) => normalizedName.includes(alias))) {
          if (aliases.some((alias) => alias.includes(query) || query.includes(alias))) {
            return true;
          }
        }
      }

      return false;
    });
  }

  if (options.category !== "all") {
    result = result.filter((p) => p.category === options.category);
  }

  if (options.status !== "all") {
    const statusFilter =
      options.status === "Low stock" ? "Low Stock" : options.status;
    result = result.filter((p) => getDisplayStatus(p) === statusFilter);
  }

  result = [...result].sort((a, b) => {
    switch (options.sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-asc":
        return a.price - b.price;
      case "stock-asc":
        return a.availableQuantity - b.availableQuantity;
      case "newest":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  return result;
}

export function getFarmerProductById(
  userId: string,
  productId: string,
): FarmerListingProduct | undefined {
  return getFarmerProducts(userId).find((product) => product.id === productId);
}

export function getFarmerProductEditHash(productId: string): string {
  return `dashboard/farmer/products/${productId}/edit`;
}
