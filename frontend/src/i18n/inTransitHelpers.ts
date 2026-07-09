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
  EtaStatus,
  InTransitAction,
  InTransitDelivery,
  InTransitIssue,
  InTransitStatus,
  TransitDriver,
  TransitEtaAlert,
} from "../app/utils/inTransitStorage";

const STATUS_KEYS: Record<InTransitStatus, string> = {
  in_transit: "inTransitPage.status.inTransit",
  near_destination: "inTransitPage.status.nearDestination",
  delayed: "inTransitPage.status.delayed",
  issue_reported: "inTransitPage.status.issueReported",
  delivered: "inTransitPage.status.delivered",
};

const ACTION_KEYS: Record<InTransitAction, string> = {
  mark_delivered: "inTransitPage.actions.markDelivered",
  resolve_issue: "inTransitPage.actions.resolveIssue",
  confirm_arrival: "inTransitPage.actions.confirmArrival",
  view_details: "inTransitPage.actions.viewDetails",
  open_route: "inTransitPage.actions.openRoute",
  contact_driver: "inTransitPage.actions.contactDriver",
  report_issue: "inTransitPage.actions.reportIssue",
  notify_buyer: "inTransitPage.actions.notifyBuyer",
};

const ETA_KEYS: Record<EtaStatus, string> = {
  on_time: "inTransitPage.etaFilter.onTime",
  delay_risk: "inTransitPage.sidebar.etaDelayRisk",
  delayed: "inTransitPage.status.delayed",
};

const DRIVER_STATUS_KEYS: Record<string, string> = {
  in_transit: "inTransitPage.status.inTransit",
  near_destination: "inTransitPage.status.nearDestination",
  delayed: "inTransitPage.status.delayed",
  issue_reported: "inTransitPage.status.issueReported",
};

const ISSUE_LABEL_KEYS: Record<string, string> = {
  "traffic delay": "inTransitPage.sidebar.issueTrafficDelay",
  "vehicle problem": "inTransitPage.sidebar.issueVehicleProblem",
};

const ALERT_KEYS: Record<string, { title: string; description: string }> = {
  "ea-1": {
    title: "inTransitPage.sidebar.alertItems.delayRisk.title",
    description: "inTransitPage.sidebar.alertItems.delayRisk.description",
  },
  "ea-2": {
    title: "inTransitPage.sidebar.alertItems.nearDestination.title",
    description: "inTransitPage.sidebar.alertItems.nearDestination.description",
  },
  "ea-3": {
    title: "inTransitPage.sidebar.alertItems.routeTrafficDelay.title",
    description: "inTransitPage.sidebar.alertItems.routeTrafficDelay.description",
  },
  "ea-4": {
    title: "inTransitPage.sidebar.alertItems.buyerWaitingConfirmation.title",
    description: "inTransitPage.sidebar.alertItems.buyerWaitingConfirmation.description",
  },
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

export function translateInTransitStatus(t: TranslateFn, status: InTransitStatus): string {
  return t(STATUS_KEYS[status], status);
}

export function translateInTransitAction(t: TranslateFn, action: InTransitAction): string {
  return t(ACTION_KEYS[action], action);
}

export function translateEtaStatus(t: TranslateFn, etaStatus: EtaStatus): string {
  return t(ETA_KEYS[etaStatus], etaStatus);
}

export function formatEtaLabel(t: TranslateFn, eta: string): string {
  return t("inTransitPage.columns.etaShort", { eta });
}

export function translateInTransitProduct(
  t: TranslateFn,
  language: Language,
  delivery: InTransitDelivery,
): string {
  if (delivery.productKey) return t(`inTransitPage.products.${delivery.productKey}`, delivery.productName);
  return getLocalizedProductName({ name: delivery.productName }, language, t);
}

export function translateInTransitVariety(
  t: TranslateFn,
  language: Language,
  variety: string,
  sortKey?: string,
): string {
  if (sortKey) return t(`inTransitPage.sort.${sortKey}`, variety);
  const localized = resolveLocalizedVariety(variety);
  if (!localized) return variety;
  return localized[language] ?? variety;
}

export function translateInTransitLocation(
  t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  return translateLogisticsLocation(t, value);
}

export function translateInTransitAddress(
  _t: TranslateFn,
  value: string,
  language?: Language,
  localized?: { en: string; az: string },
): string {
  if (localized && language) return localized[language] ?? value;
  return value;
}

export function translateInTransitRegion(t: TranslateFn, value: string): string {
  return translateLogisticsRegion(t, value);
}

export function translateInTransitDriverStatus(t: TranslateFn, status: string): string {
  const key = DRIVER_STATUS_KEYS[normalize(status)];
  return key ? t(key, status) : status;
}

export function translateTransitEtaAlert(
  t: TranslateFn,
  alert: TransitEtaAlert,
): { title: string; description: string } {
  const key = ALERT_KEYS[alert.id];
  if (!key) return { title: alert.title, description: alert.description };
  return {
    title: t(key.title, alert.title),
    description: t(key.description, alert.description),
  };
}

export function translateTransitIssueLabel(t: TranslateFn, label: string): string {
  const key = ISSUE_LABEL_KEYS[normalize(label)];
  return key ? t(key, label) : label;
}

export function translateTransitIssueStatus(t: TranslateFn, status: InTransitIssue["status"]): string {
  return t(status === "open" ? "inTransitPage.sidebar.issueStatusOpen" : "inTransitPage.sidebar.issueStatusResolved");
}

export function formatDriverRouteLabel(
  t: TranslateFn,
  driver: TransitDriver,
  language: Language,
): string {
  const [from, to] = driver.routeLabel.split("→").map((p) => p.trim());
  if (!from || !to) return driver.routeLabel;
  return `${translateInTransitLocation(t, from, language)} → ${translateInTransitLocation(t, to, language)}`;
}
