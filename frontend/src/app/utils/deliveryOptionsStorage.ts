import type {
  DeliveryMethod,
  DeliveryMethodQuote,
  ProductDeliveryCapability,
} from "../data/deliveryTypes";
import {
  getFarmerDeliverySettings,
  isFastDelivery,
  isFreeDelivery,
} from "./farmerDeliverySettingsStorage";

const SELECTION_KEY = "agrivo_selected_delivery_method";
const PRODUCT_SELECTION_PREFIX = "agrivo_product_delivery_method_";

export function getProductDeliveryCapability(
  productId: string,
  productSlug: string,
  farmerSlug: string | null,
  deliveryAvailable = true,
): ProductDeliveryCapability {
  const settings = getFarmerDeliverySettings(farmerSlug);
  return {
    productId,
    productSlug,
    farmerSlug,
    farmerDelivery: settings.farmerDeliveryEnabled && deliveryAvailable,
    agrivoLogistics: settings.logisticsEnabled,
    selfPickup: settings.pickupEnabled,
    farmerFee: settings.deliveryFee,
    logisticsFee: settings.logisticsFee,
    freeDelivery: isFreeDelivery(settings),
    fastDelivery: isFastDelivery(settings),
  };
}

export function getDeliveryMethodQuotes(
  productSlug: string,
  farmerSlug: string | null,
  deliveryAvailable = true,
): DeliveryMethodQuote[] {
  const settings = getFarmerDeliverySettings(farmerSlug);
  const hoursLabel = `${settings.deliveryHoursStart}-${settings.deliveryHoursEnd}`;
  const pickupHours = `${settings.pickupHoursStart}-${settings.pickupHoursEnd}`;

  return [
    {
      method: "farmer_delivery",
      enabled: settings.farmerDeliveryEnabled && deliveryAvailable,
      fee: settings.deliveryFee,
      estimatedTimeLabel: settings.sameDayAvailable ? "Today 16:00-19:00" : "1-2 days",
      shortDescription: "The farmer personally delivers the order.",
      meta: {
        radiusKm: settings.radiusKm,
        workingDays: settings.workingDays,
        hoursLabel,
        vehicleType: settings.vehicleType,
      },
    },
    {
      method: "agrivo_logistics",
      enabled: settings.logisticsEnabled,
      fee: settings.logisticsFee,
      estimatedTimeLabel: settings.sameDayAvailable ? "Today 14:00-20:00" : "1-3 days",
      shortDescription: "Delivery handled by Agrivo Logistics.",
      meta: {
        logisticsCompany: "Agrivo Logistics",
        hoursLabel,
      },
    },
    {
      method: "self_pickup",
      enabled: settings.pickupEnabled,
      fee: 0,
      estimatedTimeLabel: `Ready in ${settings.pickupPrepMinutes} min`,
      shortDescription: "Buyer visits the farm.",
      meta: {
        hoursLabel: pickupHours,
        prepMinutes: settings.pickupPrepMinutes,
      },
    },
  ];
}

export function getDeliveryFeeForMethod(
  method: DeliveryMethod | null | undefined,
  farmerSlug: string | null,
): number {
  if (!method || method === "self_pickup") return 0;
  const settings = getFarmerDeliverySettings(farmerSlug);
  if (method === "farmer_delivery") {
    return settings.farmerDeliveryEnabled ? settings.deliveryFee : 0;
  }
  return settings.logisticsEnabled ? settings.logisticsFee : 0;
}

/** Cart-level fee: use highest applicable fee across farmers for non-pickup, or 0 for pickup. */
export function calculateCartDeliveryFee(
  method: DeliveryMethod | null | undefined,
  farmerSlugs: Array<string | null>,
): number {
  if (!method || method === "self_pickup") return 0;
  if (farmerSlugs.length === 0) return 0;
  return Math.max(...farmerSlugs.map((slug) => getDeliveryFeeForMethod(method, slug)));
}

export function getCartDeliveryMethod(): DeliveryMethod | null {
  try {
    const raw = sessionStorage.getItem(SELECTION_KEY);
    if (raw === "farmer_delivery" || raw === "agrivo_logistics" || raw === "self_pickup") {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCartDeliveryMethod(method: DeliveryMethod | null): void {
  try {
    if (!method) {
      sessionStorage.removeItem(SELECTION_KEY);
      return;
    }
    sessionStorage.setItem(SELECTION_KEY, method);
  } catch {
    // ignore
  }
}

export function getProductDeliveryMethod(productSlug: string): DeliveryMethod | null {
  try {
    const raw = sessionStorage.getItem(`${PRODUCT_SELECTION_PREFIX}${productSlug}`);
    if (raw === "farmer_delivery" || raw === "agrivo_logistics" || raw === "self_pickup") {
      return raw;
    }
    return getCartDeliveryMethod();
  } catch {
    return getCartDeliveryMethod();
  }
}

export function setProductDeliveryMethod(productSlug: string, method: DeliveryMethod): void {
  try {
    sessionStorage.setItem(`${PRODUCT_SELECTION_PREFIX}${productSlug}`, method);
    setCartDeliveryMethod(method);
  } catch {
    // ignore
  }
}

export function listingSupportsMethod(
  farmerSlug: string | null,
  deliveryAvailable: boolean,
  method: DeliveryMethod,
): boolean {
  const cap = getProductDeliveryCapability("x", "x", farmerSlug, deliveryAvailable);
  if (method === "farmer_delivery") return cap.farmerDelivery;
  if (method === "agrivo_logistics") return cap.agrivoLogistics;
  return cap.selfPickup;
}
