import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import { translateStatus } from "./status";

const PRODUCT_KEY_MAP: Record<string, string> = {
  Tomato: "products.tomato",
  Tomatoes: "buyerDashboard.products.tomatoes",
  Apple: "products.apple",
  Apples: "buyerDashboard.products.apples",
  Potato: "products.potato",
  Potatoes: "buyerDashboard.products.potatoes",
  Carrot: "products.carrot",
  Carrots: "buyerDashboard.products.carrots",
  Cherry: "products.cherry",
  Cherries: "buyerDashboard.products.cherries",
  Cucumber: "products.cucumber",
  Cucumbers: "buyerDashboard.products.cucumbers",
  Grape: "products.grape",
  Watermelon: "products.watermelon",
  Pomegranate: "products.pomegranate",
  Pear: "products.pear",
  Pears: "buyerDashboard.products.pears",
};

const ROUTE_KEY_MAP: Record<string, string> = {
  "Quba → Baku": "buyerDashboard.routes.qubaBaku",
  "Quba → Bakı": "buyerDashboard.routes.qubaBaku",
  "Quba → Sumqayıt": "buyerDashboard.routes.qubaSumqayit",
  "Quba → Sumqayit": "buyerDashboard.routes.qubaSumqayit",
  "Gəncə → Bakı": "buyerDashboard.routes.ganjaBaku",
  "Ganja → Baku": "buyerDashboard.routes.ganjaBaku",
  "Lənkəran → Bakı": "buyerDashboard.routes.lankaranBaku",
  "Lankaran → Baku": "buyerDashboard.routes.lankaranBaku",
};

export function translateBuyerProductName(t: TranslateFn, productName: string): string {
  const key = PRODUCT_KEY_MAP[productName] ?? PRODUCT_KEY_MAP[productName.trim()];
  return key ? t(key, productName) : productName;
}

export function translateBuyerRoute(t: TranslateFn, route: string): string {
  const key = ROUTE_KEY_MAP[route];
  return key ? t(key, route) : route;
}

export function formatLocalizedQuantity(
  t: TranslateFn,
  language: Language,
  quantityWithUnit: string,
): string {
  if (language !== "az") return quantityWithUnit;
  return quantityWithUnit.replace(/\bkg\b/gi, t("buyerDashboard.common.kgShort", "kq"));
}

export function localizePriceUnit(t: TranslateFn, language: Language, value: string): string {
  if (language !== "az") return value;
  return value.replace(/\/kg\b/gi, `/${t("buyerDashboard.common.kgShort", "kq")}`);
}

export function translateBuyerOrderStatus(t: TranslateFn, status: string): string {
  return translateStatus(t, status);
}

export function formatTodayAt(t: TranslateFn, value: string): string {
  if (value.toLowerCase().startsWith("today")) {
    const time = value.split(",")[1]?.trim();
    return time
      ? t("buyerDashboard.currentDelivery.todayAt").replace("{time}", time)
      : t("buyerDashboard.currentDelivery.todayLabel");
  }
  return value;
}
