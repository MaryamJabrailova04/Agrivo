import type { BuyerOrderStatus } from "../../data/buyerDashboard";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateStatus } from "../../../i18n/status";

export function BuyerOrderStatusBadge({ status }: { status: BuyerOrderStatus | string }) {
  const { t } = useLanguage();
  const normalized = status.toLowerCase();
  const label = translateStatus(t, status);

  const tone =
    normalized === "delivered" || normalized === "completed"
      ? "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]"
      : normalized === "in transit"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : normalized === "cancelled"
          ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
          : normalized === "pickup scheduled"
            ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
            : normalized === "preparing"
              ? "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]"
              : normalized === "pending"
                ? "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]"
                : "bg-[#f0f7ee] text-[#14532D] border-[#dbe7d4]";

  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}
