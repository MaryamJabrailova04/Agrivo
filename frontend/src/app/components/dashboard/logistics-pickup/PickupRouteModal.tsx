import { MapPin, Navigation } from "lucide-react";
import { todayRouteData } from "../../../data/logisticsRoutes";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translatePickupAddress,
  translatePickupLocation,
} from "../../../../i18n/pickupTasksHelpers";
import { RouteMap } from "../../logistics/RouteMap";
import type { PickupTask } from "../../../utils/pickupTasksStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface PickupRouteModalProps {
  task: PickupTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PickupRouteModal({ task, open, onOpenChange }: PickupRouteModalProps) {
  const { t, language } = useLanguage();
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-route-dialog sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
            {t("pickupTasks.routeModal.title")} · {task.taskId}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {translatePickupLocation(t, task.pickupLocation, language, task.pickupLocationLocalized)} →{" "}
            {translatePickupLocation(t, task.destination, language, task.destinationLocalized)}
          </DialogDescription>
        </DialogHeader>

        <div className="agrivo-assigned-route-summary">
          <div className="agrivo-assigned-route-point">
            <MapPin className="h-4 w-4 text-[#43A047]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("pickupTasks.routeModal.farmPickup")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translatePickupLocation(t, task.pickupLocation, language, task.pickupLocationLocalized)}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {translatePickupAddress(t, task.pickupAddress, language, task.pickupAddressLocalized)}
              </p>
            </div>
          </div>
          <div className="agrivo-assigned-route-point">
            <Navigation className="h-4 w-4 text-[#14532D]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("pickupTasks.modal.destination")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translatePickupLocation(t, task.destination, language, task.destinationLocalized)}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {t("pickupTasks.routeModal.etaAfterCollection", { time: task.pickupTime })}
              </p>
            </div>
          </div>
        </div>

        <RouteMap route={todayRouteData} className="agrivo-assigned-route-map" />

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => onOpenChange(false)}
          >
            {t("pickupTasks.actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
