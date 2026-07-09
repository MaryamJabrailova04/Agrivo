import type { FarmerManagementOrderStatus } from "../../../utils/farmerOrdersStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateFarmerOrderStatus } from "../../../../i18n/farmerOrderHelpers";
import { cn } from "../../ui/utils";

const STATUS_TONES: Record<FarmerManagementOrderStatus, string> = {
  pending: "agrivo-farmer-order-status--pending",
  accepted: "agrivo-farmer-order-status--accepted",
  preparing: "agrivo-farmer-order-status--preparing",
  ready_for_pickup: "agrivo-farmer-order-status--ready",
  delivered: "agrivo-farmer-order-status--delivered",
  cancelled: "agrivo-farmer-order-status--cancelled",
};

export function FarmerMgmtOrderStatusBadge({
  status,
  className,
}: {
  status: FarmerManagementOrderStatus;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <span
      className={cn(
        "agrivo-farmer-order-status",
        STATUS_TONES[status],
        className,
      )}
    >
      {translateFarmerOrderStatus(t, status)}
    </span>
  );
}
