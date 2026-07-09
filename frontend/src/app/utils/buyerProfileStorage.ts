import type { AuthUser } from "../auth/authStorage";
import type { TranslateFn } from "../../i18n/LanguageContext";

export type BuyerType =
  | "Restaurant"
  | "Supermarket"
  | "Local greengrocer"
  | "Bazaar seller"
  | "Wholesale buyer"
  | "Other";

export type DeliveryMethod = "Agrivo logistics" | "Farmer delivery" | "Pickup from farm";
export type NotificationPreference = "WhatsApp" | "Email" | "Phone";
export type ProductCategory = "Vegetables" | "Fruits" | "Dairy Products";

export interface DeliveryAddress {
  id: string;
  label: string;
  cityDistrict: string;
  fullAddress: string;
  phone: string;
  isDefault: boolean;
}

export interface BuyerProfile {
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  location: string;
  joinedAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  businessName: string;
  buyerType: BuyerType;
  businessAddress: string;
  taxId: string;
  businessCategories: ProductCategory[];
  preferredCategories: ProductCategory[];
  preferredRegions: string[];
  preferredDeliveryMethod: DeliveryMethod;
  notificationPreference: NotificationPreference;
  deliveryAddresses: DeliveryAddress[];
  lastLogin: string;
}

const STORAGE_KEY_PREFIX = "agrivo_buyer_profile_";

export function resolveProfileUserId(user: AuthUser): string {
  return user.id || "demo_buyer";
}

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function generateAddressId(): string {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultAddresses(): DeliveryAddress[] {
  return [
    {
      id: "addr-main-shop",
      label: "Main Shop",
      cityDistrict: "Baku, Nizami district",
      fullAddress: "Local Produce Shop, Ataturk avenue 25",
      phone: "+994 50 123 45 67",
      isDefault: true,
    },
    {
      id: "addr-warehouse",
      label: "Warehouse",
      cityDistrict: "Baku, Binagadi district",
      fullAddress: "Market warehouse entrance 2",
      phone: "+994 55 222 33 44",
      isDefault: false,
    },
  ];
}

export function createDefaultBuyerProfile(user: AuthUser): BuyerProfile {
  const joined = new Date();
  joined.setMonth(joined.getMonth() - 1);

  return {
    fullName: user.name || "Demo Buyer",
    email: user.email,
    phone: user.phone || "+994 50 123 45 67",
    avatar: null,
    location: "Baku, Azerbaijan",
    joinedAt: joined.toISOString(),
    emailVerified: true,
    phoneVerified: true,
    businessName: "Green Market Baku",
    buyerType: "Local greengrocer",
    businessAddress: "Baku, Nizami district",
    taxId: "",
    businessCategories: ["Vegetables", "Fruits"],
    preferredCategories: ["Vegetables", "Fruits"],
    preferredRegions: ["Lənkəran-Astara", "Quba-Xaçmaz", "Bakı"],
    preferredDeliveryMethod: "Agrivo logistics",
    notificationPreference: "WhatsApp",
    deliveryAddresses: defaultAddresses(),
    lastLogin: "Today",
  };
}

export function getBuyerProfile(user: AuthUser): BuyerProfile {
  const userId = resolveProfileUserId(user);
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const defaults = createDefaultBuyerProfile(user);
    if (!raw) {
      setBuyerProfile(userId, defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<BuyerProfile>;
    return {
      ...defaults,
      ...parsed,
      fullName: parsed.fullName?.trim() || defaults.fullName,
      email: parsed.email?.trim() || defaults.email,
      phone: parsed.phone?.trim() || defaults.phone,
      deliveryAddresses: Array.isArray(parsed.deliveryAddresses)
        ? parsed.deliveryAddresses
        : defaults.deliveryAddresses,
      businessCategories: Array.isArray(parsed.businessCategories)
        ? parsed.businessCategories
        : defaults.businessCategories,
      preferredCategories: Array.isArray(parsed.preferredCategories)
        ? parsed.preferredCategories
        : defaults.preferredCategories,
      preferredRegions: Array.isArray(parsed.preferredRegions)
        ? parsed.preferredRegions
        : defaults.preferredRegions,
    };
  } catch {
    return createDefaultBuyerProfile(user);
  }
}

export function validateBuyerProfile(
  profile: Pick<BuyerProfile, "fullName" | "email" | "phone" | "buyerType">,
  t?: TranslateFn,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const required = t ? t("buyerProfile.feedback.requiredFields") : "Please fill in required fields.";
  const invalidEmail = t ? t("buyerProfile.feedback.invalidEmail") : "Enter a valid email address.";
  if (!profile.fullName.trim()) {
    errors.fullName = required;
  }
  if (!profile.email.trim()) {
    errors.email = invalidEmail;
  } else if (!isValidEmail(profile.email)) {
    errors.email = invalidEmail;
  }
  if (!profile.phone.trim()) {
    errors.phone = required;
  }
  if (!profile.buyerType) {
    errors.buyerType = required;
  }
  return errors;
}

export function cloneBuyerProfile(profile: BuyerProfile): BuyerProfile {
  return {
    ...profile,
    businessCategories: [...profile.businessCategories],
    preferredCategories: [...profile.preferredCategories],
    preferredRegions: [...profile.preferredRegions],
    deliveryAddresses: profile.deliveryAddresses.map((address) => ({ ...address })),
  };
}

export function setBuyerProfile(userId: string, profile: BuyerProfile): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(profile));
}

export function formatJoinedDate(iso: string, locale = "en-US"): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function getProfileInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function mergeAddDeliveryAddress(
  profile: BuyerProfile,
  address: Omit<DeliveryAddress, "id" | "isDefault"> & { isDefault?: boolean },
): BuyerProfile {
  const isFirst = profile.deliveryAddresses.length === 0;
  const newAddress: DeliveryAddress = {
    id: generateAddressId(),
    label: address.label,
    cityDistrict: address.cityDistrict,
    fullAddress: address.fullAddress,
    phone: address.phone,
    isDefault: isFirst || Boolean(address.isDefault),
  };

  let addresses = [...profile.deliveryAddresses, newAddress];
  if (newAddress.isDefault) {
    addresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === newAddress.id,
    }));
  }

  return { ...profile, deliveryAddresses: addresses };
}

export function mergeUpdateDeliveryAddress(
  profile: BuyerProfile,
  addressId: string,
  updates: Partial<Omit<DeliveryAddress, "id">>,
): BuyerProfile {
  const addresses = profile.deliveryAddresses.map((item) =>
    item.id === addressId ? { ...item, ...updates } : item,
  );
  return { ...profile, deliveryAddresses: addresses };
}

export function mergeDeleteDeliveryAddress(profile: BuyerProfile, addressId: string): BuyerProfile {
  const remaining = profile.deliveryAddresses.filter((item) => item.id !== addressId);
  if (remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }
  return { ...profile, deliveryAddresses: remaining };
}

export function mergeSetDefaultDeliveryAddress(
  profile: BuyerProfile,
  addressId: string,
): BuyerProfile {
  const addresses = profile.deliveryAddresses.map((item) => ({
    ...item,
    isDefault: item.id === addressId,
  }));
  return { ...profile, deliveryAddresses: addresses };
}

export function addDeliveryAddress(
  userId: string,
  profile: BuyerProfile,
  address: Omit<DeliveryAddress, "id" | "isDefault"> & { isDefault?: boolean },
): BuyerProfile {
  const next = mergeAddDeliveryAddress(profile, address);
  setBuyerProfile(userId, next);
  return next;
}

export function updateDeliveryAddress(
  userId: string,
  profile: BuyerProfile,
  addressId: string,
  updates: Partial<Omit<DeliveryAddress, "id">>,
): BuyerProfile {
  const next = mergeUpdateDeliveryAddress(profile, addressId, updates);
  setBuyerProfile(userId, next);
  return next;
}

export function deleteDeliveryAddress(
  userId: string,
  profile: BuyerProfile,
  addressId: string,
): BuyerProfile {
  const next = mergeDeleteDeliveryAddress(profile, addressId);
  setBuyerProfile(userId, next);
  return next;
}

export function setDefaultDeliveryAddress(
  userId: string,
  profile: BuyerProfile,
  addressId: string,
): BuyerProfile {
  const next = mergeSetDefaultDeliveryAddress(profile, addressId);
  setBuyerProfile(userId, next);
  return next;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
