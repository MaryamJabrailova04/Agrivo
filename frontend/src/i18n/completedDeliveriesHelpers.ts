import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import {
  getLocalizedProductName,
  resolveLocalizedVariety,
} from "./farmerProductHelpers";
import {
  translateLogisticsLocation,
  translateLogisticsRegion,
} from "./logisticsDashboardHelpers";
import type {
  CompletedDateFilter,
  CompletedDelivery,
  CompletedFeedback,
  CompletedRatingFilter,
  CompletionStatus,
  ProofStatus,
  TopRoute,
} from "../app/utils/completedDeliveriesStorage";

const STATUS_KEYS: Record<CompletionStatus, string> = {
  completed_on_time: "completedDeliveries.status.completedOnTime",
  completed_late: "completedDeliveries.status.completedLate",
  completed_with_issue: "completedDeliveries.status.completedWithIssue",
};

const STATUS_SHORT_KEYS: Record<CompletionStatus, string> = {
  completed_on_time: "completedDeliveries.status.onTime",
  completed_late: "completedDeliveries.status.late",
  completed_with_issue: "completedDeliveries.status.withIssue",
};

const PROOF_KEYS: Record<ProofStatus, string> = {
  photo_signature: "completedDeliveries.proof.photoSignature",
  signature: "completedDeliveries.proof.signature",
  photo: "completedDeliveries.proof.photo",
  none: "completedDeliveries.proof.none",
};

const DATE_FILTER_KEYS: Record<CompletedDateFilter, string> = {
  today: "completedDeliveries.filters.today",
  week: "completedDeliveries.filters.thisWeek",
  month: "completedDeliveries.filters.thisMonth",
  all: "completedDeliveries.filters.allTime",
};

const RATING_FILTER_KEYS: Record<CompletedRatingFilter, string> = {
  all: "completedDeliveries.filters.allRatings",
  "5": "completedDeliveries.filters.fiveStars",
  "4plus": "completedDeliveries.filters.fourPlusStars",
  below4: "completedDeliveries.filters.belowFour",
};

const DAY_KEYS: Record<string, string> = {
  today: "completedDeliveries.time.today",
  mon: "completedDeliveries.time.mon",
  tue: "completedDeliveries.time.tue",
  wed: "completedDeliveries.time.wed",
  thu: "completedDeliveries.time.thu",
  fri: "completedDeliveries.time.fri",
  sat: "completedDeliveries.time.sat",
  sun: "completedDeliveries.time.sun",
};

const TOP_ROUTE_KEYS: Record<string, string> = {
  "tr-1": "completedDeliveries.sidebar.topRoutes.tr1",
  "tr-2": "completedDeliveries.sidebar.topRoutes.tr2",
  "tr-3": "completedDeliveries.sidebar.topRoutes.tr3",
  "tr-4": "completedDeliveries.sidebar.topRoutes.tr4",
};

const FEEDBACK_KEYS: Record<string, string> = {
  "fb-1": "completedDeliveries.sidebar.feedbackItems.fb1",
  "fb-2": "completedDeliveries.sidebar.feedbackItems.fb2",
  "fb-3": "completedDeliveries.sidebar.feedbackItems.fb3",
};

const DELIVERY_FEEDBACK_KEYS: Record<string, string> = {
  "cd-1": "completedDeliveries.feedbackItems.cd1",
  "cd-2": "completedDeliveries.feedbackItems.cd2",
  "cd-3": "completedDeliveries.feedbackItems.cd3",
  "cd-4": "completedDeliveries.feedbackItems.cd4",
  "cd-5": "completedDeliveries.feedbackItems.cd5",
  "cd-6": "completedDeliveries.feedbackItems.cd6",
  "cd-7": "completedDeliveries.feedbackItems.cd7",
  "cd-8": "completedDeliveries.feedbackItems.cd8",
  "cd-9": "completedDeliveries.feedbackItems.cd9",
  "cd-10": "completedDeliveries.feedbackItems.cd10",
};

export function translateCompletedStatus(
  t: TranslateFn,
  status: CompletionStatus,
  short = false,
): string {
  const keys = short ? STATUS_SHORT_KEYS : STATUS_KEYS;
  return t(keys[status], status);
}

export function translateProofStatus(t: TranslateFn, proofStatus: ProofStatus): string {
  return t(PROOF_KEYS[proofStatus], proofStatus);
}

export function translateCompletedDateFilter(t: TranslateFn, filter: CompletedDateFilter): string {
  return t(DATE_FILTER_KEYS[filter], filter);
}

export function translateCompletedRatingFilter(
  t: TranslateFn,
  filter: CompletedRatingFilter,
): string {
  return t(RATING_FILTER_KEYS[filter], filter);
}

export function translateCompletedProduct(
  t: TranslateFn,
  language: Language,
  delivery: CompletedDelivery,
): string {
  if (delivery.productKey) {
    return t(`completedDeliveries.products.${delivery.productKey}`, delivery.productName);
  }
  return getLocalizedProductName({ name: delivery.productName }, language, t);
}

export function translateCompletedVariety(
  t: TranslateFn,
  language: Language,
  variety: string,
  sortKey?: string,
): string {
  if (sortKey) return t(`completedDeliveries.sort.${sortKey}`, variety);
  const localized = resolveLocalizedVariety(variety);
  if (!localized) return variety;
  return localized[language] ?? variety;
}

export function translateCompletedLocation(
  t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  return translateLogisticsLocation(t, value);
}

export function translateCompletedAddress(
  _t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  return value;
}

export function translateCompletedRegion(t: TranslateFn, value: string): string {
  return translateLogisticsRegion(t, value);
}

export function translateCompletedTime(t: TranslateFn, completedAt: string): string {
  const [dayPart, ...rest] = completedAt.split(",").map((part) => part.trim());
  const timePart = rest.join(", ");
  const dayKey = DAY_KEYS[dayPart.toLowerCase()];
  if (!dayKey) return completedAt.replace(",", "");
  const localizedDay = t(dayKey, dayPart);
  return timePart ? `${localizedDay}, ${timePart}` : localizedDay;
}

export function formatDeliveredWeightLocalized(t: TranslateFn, kg: number): string {
  if (kg >= 1000) {
    return t("completedDeliveries.units.tons", { value: (kg / 1000).toFixed(1) });
  }
  return t("completedDeliveries.units.kg", { value: String(kg) });
}

export function translateTopRoute(t: TranslateFn, route: TopRoute): string {
  const key = route.id ? TOP_ROUTE_KEYS[route.id] : undefined;
  return key ? t(key, route.route) : route.route;
}

export function translateFeedbackQuote(t: TranslateFn, feedback: CompletedFeedback): string {
  const key = FEEDBACK_KEYS[feedback.id];
  return key ? t(key, feedback.quote) : feedback.quote;
}

export function translateDeliveryFeedback(
  t: TranslateFn,
  delivery: CompletedDelivery,
): string {
  const key = DELIVERY_FEEDBACK_KEYS[delivery.id];
  return key ? t(key, delivery.feedback) : delivery.feedback;
}

export function formatCompletedRouteLabel(
  t: TranslateFn,
  delivery: CompletedDelivery,
  language: Language,
): string {
  const pickup = translateCompletedLocation(
    t,
    delivery.pickupLocation,
    language,
    delivery.pickupLocationLocalized,
  );
  const dropoff = translateCompletedLocation(
    t,
    delivery.dropoffLocation,
    language,
    delivery.dropoffLocationLocalized,
  );
  return `${pickup} → ${dropoff}`;
}
