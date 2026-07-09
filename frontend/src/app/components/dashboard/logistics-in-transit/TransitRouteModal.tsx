import { Crosshair, MapPin, Navigation, Truck } from "lucide-react";
import { useState } from "react";
import { todayRouteData } from "../../../data/logisticsRoutes";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatEtaLabel, translateInTransitLocation } from "../../../../i18n/inTransitHelpers";
import { RouteMap } from "../../logistics/RouteMap";
import type { InTransitDelivery } from "../../../utils/inTransitStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export function TransitRouteModal({
  delivery,
  open,
  onOpenChange,
}: {
  delivery: InTransitDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, language } = useLanguage();
  const [centerTrigger, setCenterTrigger] = useState(0);

  if (!delivery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-route-dialog sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
            {t("inTransitPage.routeModal.liveRoute")} · {delivery.taskId}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {translateInTransitLocation(
              t,
              delivery.pickupLocation,
              language,
              delivery.pickupLocationLocalized,
            )}{" "}
            →{" "}
            {translateInTransitLocation(
              t,
              delivery.dropoffLocation,
              language,
              delivery.dropoffLocationLocalized,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="agrivo-transit-route-meta">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("inTransitPage.columns.eta")}
            </p>
            <p className="text-sm font-bold text-[#14532D]">{formatEtaLabel(t, delivery.eta)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("inTransitPage.columns.distanceRemaining")}
            </p>
            <p className="text-sm font-bold text-[#102018]">{delivery.distanceRemaining}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("inTransitPage.columns.vehicle")}
            </p>
            <p className="text-sm font-bold text-[#102018]">{delivery.vehicle}</p>
          </div>
        </div>

        <div className="agrivo-assigned-route-summary">
          <div className="agrivo-assigned-route-point">
            <MapPin className="h-4 w-4 text-[#43A047]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("inTransitPage.routeModal.pickup")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translateInTransitLocation(
                  t,
                  delivery.pickupLocation,
                  language,
                  delivery.pickupLocationLocalized,
                )}
              </p>
            </div>
          </div>
          <div className="agrivo-assigned-route-point">
            <Truck className="h-4 w-4 text-[#14532D]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("inTransitPage.routeModal.current")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translateInTransitLocation(
                  t,
                  delivery.currentLocation,
                  language,
                  delivery.currentLocationLocalized,
                )}
              </p>
            </div>
          </div>
          <div className="agrivo-assigned-route-point">
            <Navigation className="h-4 w-4 text-[#14532D]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
                {t("inTransitPage.routeModal.destination")}
              </p>
              <p className="text-sm font-semibold text-[#102018]">
                {translateInTransitLocation(
                  t,
                  delivery.dropoffLocation,
                  language,
                  delivery.dropoffLocationLocalized,
                )}
              </p>
            </div>
          </div>
        </div>

        <RouteMap
          key={centerTrigger}
          route={todayRouteData}
          className="agrivo-transit-route-modal-map"
        />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => setCenterTrigger((v) => v + 1)}
          >
            <Crosshair className="mr-2 h-4 w-4" />
            {t("inTransitPage.routeModal.centerVehicle")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => onOpenChange(false)}
          >
            {t("inTransitPage.actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
