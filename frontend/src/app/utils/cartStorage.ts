import type { HarvestListing } from "../data/harvestExplorer";
import type { DeliveryMethod } from "../data/deliveryTypes";
import { districtShortName } from "../data/harvestExplorerUtils";
import type { SavedProduct } from "./savedProductsStorage";
import { calculateCartDeliveryFee } from "./deliveryOptionsStorage";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  farmer: string;
  farmerSlug: string | null;
  location: string;
  price: string;
  unit: string;
  availableQuantity: number;
  availableQuantityLabel: string;
  selectedQuantity: number;
  deliveryAvailable: boolean;
  minimumOrder: number;
  step: number;
  pricePerUnit: number;
  addedAt: string;
}

export const CART_CHANGED_EVENT = "agrivo-cart-changed";

function storageKey(userId: string): string {
  return `agrivo_cart_${userId}`;
}

export function notifyCartChanged(): void {
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function getCartItems(userId: string): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCartItems(userId: string, items: CartItem[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(items));
  notifyCartChanged();
}

export function clearCart(userId: string): void {
  localStorage.removeItem(storageKey(userId));
  notifyCartChanged();
}

export function parseNumericAmount(value: string): number {
  const match = value.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

export function parseQuantityLabel(label: string): { value: number; unit: string } {
  const match = label.match(/([\d.]+)\s*(.*)/);
  if (!match) return { value: 0, unit: "unit" };
  return {
    value: Number.parseFloat(match[1]),
    unit: match[2]?.trim() || "unit",
  };
}

export function getQuantityStep(_unit?: string): number {
  return 1;
}

export function formatQuantity(value: number, unit: string): string {
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(1));
  return `${rounded} ${unit}`.trim();
}

export function cartItemFromListing(listing: HarvestListing): Omit<CartItem, "selectedQuantity" | "addedAt"> {
  const location = `${listing.economicRegion} > ${districtShortName(listing.district)}${
    listing.village ? ` > ${listing.village}` : ""
  }`;
  const { value: availableQuantity, unit } = parseQuantityLabel(listing.quantity);
  const minParsed = parseQuantityLabel(listing.minimumOrder ?? "20 kg");
  const minimumOrder = minParsed.value || getQuantityStep(unit);
  const step = getQuantityStep(unit);
  const pricePerUnit = parseNumericAmount(listing.pricePerKg);

  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    category: listing.category ?? "Produce",
    image: listing.image,
    farmer: listing.farmer,
    farmerSlug: listing.farmerSlug,
    location,
    price: listing.pricePerKg,
    unit,
    availableQuantity: availableQuantity || 100,
    availableQuantityLabel: listing.quantity,
    deliveryAvailable: listing.deliveryAvailable,
    minimumOrder,
    step,
    pricePerUnit,
  };
}

export function cartItemFromSavedProduct(product: SavedProduct): Omit<CartItem, "selectedQuantity" | "addedAt"> {
  const { value: availableQuantity, unit } = parseQuantityLabel(product.quantity);
  const step = getQuantityStep(product.unit || unit);
  const minimumOrder = Math.min(availableQuantity, step * 4) || step;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    image: product.image,
    farmer: product.farmer,
    farmerSlug: product.farmerSlug,
    location: product.location,
    price: product.price,
    unit: product.unit || unit,
    availableQuantity: availableQuantity || 100,
    availableQuantityLabel: product.quantity,
    deliveryAvailable: product.deliveryAvailable,
    minimumOrder,
    step,
    pricePerUnit: parseNumericAmount(product.price),
  };
}

export function getCartItemSubtotal(item: CartItem): number {
  return item.pricePerUnit * item.selectedQuantity;
}

export function addOrUpdateCartItem(
  userId: string,
  base: Omit<CartItem, "selectedQuantity" | "addedAt">,
  quantityToAdd?: number,
): { items: CartItem[]; outcome: "added" | "quantity_updated" | "already_at_max" } {
  const items = getCartItems(userId);
  const existing = items.find((item) => item.slug === base.slug);
  const addAmount = quantityToAdd ?? base.minimumOrder;

  if (existing) {
    if (existing.selectedQuantity >= existing.availableQuantity) {
      return { items, outcome: "already_at_max" };
    }
    const nextQty = Math.min(existing.availableQuantity, existing.selectedQuantity + addAmount);
    if (nextQty === existing.selectedQuantity) {
      return { items, outcome: "already_at_max" };
    }
    const next = items.map((item) =>
      item.slug === base.slug ? { ...item, selectedQuantity: nextQty } : item,
    );
    setCartItems(userId, next);
    return { items: next, outcome: "quantity_updated" };
  }

  const initialQty = Math.min(base.availableQuantity, Math.max(base.minimumOrder, addAmount));
  const newItem: CartItem = {
    ...base,
    selectedQuantity: initialQty,
    addedAt: new Date().toISOString(),
  };
  const next = [newItem, ...items];
  setCartItems(userId, next);
  return { items: next, outcome: "added" };
}

export function updateCartItemQuantity(
  userId: string,
  slug: string,
  selectedQuantity: number,
): CartItem[] {
  const next = getCartItems(userId).map((item) =>
    item.slug === slug ? { ...item, selectedQuantity } : item,
  );
  setCartItems(userId, next);
  return next;
}

export function removeCartItem(userId: string, slug: string): CartItem[] {
  const next = getCartItems(userId).filter((item) => item.slug !== slug);
  setCartItems(userId, next);
  return next;
}

export function getCartSummary(items: CartItem[], deliveryMethod?: DeliveryMethod | null) {
  const productsSubtotal = items.reduce((sum, item) => sum + getCartItemSubtotal(item), 0);
  const farmerCount = new Set(items.map((item) => item.farmer)).size;

  let deliveryFee = 0;
  if (items.length > 0) {
    deliveryFee = deliveryMethod
      ? calculateCartDeliveryFee(
          deliveryMethod,
          items.map((item) => item.farmerSlug),
        )
      : 6 + Math.max(0, items.length - 1) * 2;
  }

  const serviceFee = 0;

  return {
    itemCount: items.length,
    farmerCount,
    productsSubtotal,
    deliveryFee,
    serviceFee,
    total: productsSubtotal + deliveryFee + serviceFee,
  };
}
