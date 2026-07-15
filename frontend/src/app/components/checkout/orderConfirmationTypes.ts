export type CheckoutStep = "checkout" | "processing" | "success" | "tracking";

/** @deprecated Prefer CheckoutStep */
export type CheckoutPhase = CheckoutStep;

export interface OrderConfirmationPayload {
  orderNumber: string;
  displayOrderNumber: string;
  totalPaid: number;
  paymentLabel: string;
  deliveryAddress: string;
  farmerLabel: string;
  deliveryMethodLabel: string;
  etaLabel: string;
  primaryOrderId: string;
}

export function formatDisplayOrderNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const digits = orderId.replace(/\D/g, "").slice(-5).padStart(5, "0");
  return `#AGR-${year}-${digits}`;
}
