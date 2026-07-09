import { Download, Eye, Headphones, MoreHorizontal, ShieldCheck } from "lucide-react";
import type { CompletedDelivery } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export function DeliveryActionsCell({
  delivery,
  onView,
  onViewProof,
  onDownloadReceipt,
  onContactSupport,
}: {
  delivery: CompletedDelivery;
  onView: (delivery: CompletedDelivery) => void;
  onViewProof?: (delivery: CompletedDelivery) => void;
  onDownloadReceipt?: (delivery: CompletedDelivery) => void;
  onContactSupport?: (delivery: CompletedDelivery) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="agrivo-completed-actions-cell">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="agrivo-completed-actions-cell__view rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
        onClick={() => onView(delivery)}
      >
        <Eye className="mr-1.5 h-3.5 w-3.5" />
        {t("completedDeliveries.actions.view")}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="agrivo-completed-actions-cell__more h-8 w-8 rounded-full p-0 text-[#5F6F64] hover:bg-[#EAF7EC] hover:text-[#14532D]"
            aria-label={t("completedDeliveries.actions.moreActionsFor", { taskId: delivery.taskId })}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem]">
          <DropdownMenuItem onClick={() => (onViewProof ?? onView)(delivery)}>
            <ShieldCheck className="h-4 w-4" />
            {t("completedDeliveries.actions.viewProof")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => (onDownloadReceipt ?? onView)(delivery)}>
            <Download className="h-4 w-4" />
            {t("completedDeliveries.actions.downloadReceipt")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => (onContactSupport ?? onView)(delivery)}>
            <Headphones className="h-4 w-4" />
            {t("completedDeliveries.actions.contactSupport")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
