import { MapPin, Navigation } from "lucide-react";
import { todayRouteData } from "../../../data/logisticsRoutes";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateAssignedAddressValue,
  translateAssignedLocation,
} from "../../../../i18n/assignedDeliveriesHelpers";
import { RouteMap } from "../../logistics/RouteMap";
import type { AssignedDelivery } from "../../../utils/assignedDeliveriesStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface DeliveryRouteModalProps {
  delivery: AssignedDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliveryRouteModal({ delivery, open, onOpenChange }: DeliveryRouteModalProps) {
  const { t, language } = useLanguage();
  if (!delivery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-route-dialog sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
            {t("assignedDeliveries.routeModal.title")} · {delivery.taskId}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {translateAssignedLocation(
              t,
              delivery.pickupLocation,
              language,
              delivery.pickupLocationLocalized,
            )}{" "}
            →{" "}
            {translateAssignedLocation(
              t,
              delivery.dropoffLocation,
              language,
              delivery.dropoffLocationLocalized,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="agrivo-assigned-route-summary">
          <div className="agrivo-assigned-route-point">
            <MapPin className="h-4 w-4 text-[#43A047]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("assignedDeliveries.routeModal.pickup")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translateAssignedLocation(
                  t,
                  delivery.pickupLocation,
                  language,
                  delivery.pickupLocationLocalized,
                )}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {translateAssignedAddressValue(
                  t,
                  delivery.pickupAddress,
                  language,
                  delivery.pickupAddressLocalized,
                )}
              </p>
            </div>
          </div>
          <div className="agrivo-assigned-route-point">
            <Navigation className="h-4 w-4 text-[#14532D]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("assignedDeliveries.routeModal.dropoff")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translateAssignedLocation(
                  t,
                  delivery.dropoffLocation,
                  language,
                  delivery.dropoffLocationLocalized,
                )}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {translateAssignedAddressValue(
                  t,
                  delivery.dropoffAddress,
                  language,
                  delivery.dropoffAddressLocalized,
                )}
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
            {t("assignedDeliveries.actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
