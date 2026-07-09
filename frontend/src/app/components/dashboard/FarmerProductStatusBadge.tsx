import type { FarmerProductDisplayStatus } from "../../utils/farmerProductsStorage";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateFarmerProductStatus } from "../../../i18n/farmerProductHelpers";

export function FarmerProductStatusBadge({ status }: { status: FarmerProductDisplayStatus }) {
  const { t } = useLanguage();
  const tone =
    status === "Active"
      ? "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]"
      : status === "Low Stock"
        ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
        : status === "Draft"
          ? "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]"
          : status === "Out of Stock"
            ? "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
            : "bg-[#f8faf4] text-[#6b7a70] border-[#dbe7d4]";

  return (
    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {translateFarmerProductStatus(t, status)}
    </span>
  );
}
