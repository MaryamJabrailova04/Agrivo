import type { FarmerOrderStatus } from "../../data/farmerDashboard";
import { useLanguage } from "../../../i18n/LanguageContext";

export function FarmerOrderStatusBadge({ status }: { status: FarmerOrderStatus | string }) {
  const { t } = useLanguage();
  const normalized = status.toLowerCase();
  const label =
    status === "New"
      ? t("status.new")
      : status === "Confirmed"
        ? t("status.confirmed")
        : status === "Pickup scheduled"
          ? t("status.pickupScheduled")
          : status === "In transit"
            ? t("status.inTransit")
            : status === "Delivered"
              ? t("status.delivered")
              : status === "Cancelled"
                ? t("status.cancelled")
                : status;

  const tone =
    normalized === "delivered"
      ? "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]"
      : normalized === "in transit"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : normalized === "cancelled"
          ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
          : normalized === "pickup scheduled"
            ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
            : normalized === "new"
              ? "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]"
              : "bg-[#f0f7ee] text-[#14532D] border-[#dbe7d4]";

  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}
