import type { TranslateFn } from "../../i18n/LanguageContext";
import type {
  DeliveryMethod,
  DeliveryTrackingStepId,
  FarmerVehicleType,
  Weekday,
} from "../data/deliveryTypes";

export function translateDeliveryMethod(t: TranslateFn, method: DeliveryMethod): string {
  return t(`delivery.methods.${method}.title`, method);
}

export function translateDeliveryMethodDesc(t: TranslateFn, method: DeliveryMethod): string {
  return t(`delivery.methods.${method}.description`, "");
}

export function translateTrackingStep(t: TranslateFn, stepId: DeliveryTrackingStepId): string {
  return t(`delivery.timeline.${stepId}`, stepId);
}

export function translateWeekday(t: TranslateFn, day: Weekday): string {
  return t(`delivery.weekdays.${day}`, day);
}

export function translateVehicleType(t: TranslateFn, vehicle: FarmerVehicleType): string {
  return t(`delivery.vehicles.${vehicle}`, vehicle);
}

export function formatDeliveryFee(fee: number, currency = "AZN"): string {
  if (fee <= 0) return "0 " + currency;
  return `${fee} ${currency}`;
}
