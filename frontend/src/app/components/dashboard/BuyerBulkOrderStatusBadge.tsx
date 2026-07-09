import type { BulkOrderStatus } from "../../utils/bulkOrdersStorage";
import { useLanguage } from "../../../i18n/LanguageContext";
import { cn } from "../ui/utils";

const STATUS_STYLES: Record<BulkOrderStatus, string> = {
  Open: "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]",
  "Offers Received": "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  Accepted: "bg-[#14532D] text-white border-[#14532D]",
  "In Progress": "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
  Fulfilled: "bg-[#ecfdf5] text-[#15803d] border-[#86efac]",
  Cancelled: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]",
};

export function BuyerBulkOrderStatusBadge({ status }: { status: BulkOrderStatus }) {
  const { t } = useLanguage();
  const labelMap: Record<BulkOrderStatus, string> = {
    Open: t("buyerBulkOrders.status.active"),
    "Offers Received": t("buyerBulkOrders.status.offersReceived"),
    Accepted: t("buyerBulkOrders.status.accepted"),
    "In Progress": t("buyerBulkOrders.status.pending"),
    Fulfilled: t("buyerBulkOrders.status.fulfilled"),
    Cancelled: t("buyerBulkOrders.status.cancelled"),
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {labelMap[status]}
    </span>
  );
}
