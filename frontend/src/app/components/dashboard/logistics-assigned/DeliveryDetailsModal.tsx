import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateAssignedAddressValue,
  translateAssignedBuyerTypeValue,
  translateAssignedLocation,
  translateAssignedNotes,
  translateAssignedProduct,
  translateAssignedRegion,
  translateAssignedVariety,
} from "../../../../i18n/assignedDeliveriesHelpers";
import {
  formatAssignedQuantity,
  type AssignedDelivery,
} from "../../../utils/assignedDeliveriesStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { PriorityBadge } from "./PriorityBadge";

interface DeliveryDetailsModalProps {
  delivery: AssignedDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliveryDetailsModal({
  delivery,
  open,
  onOpenChange,
}: DeliveryDetailsModalProps) {
  const { t, language } = useLanguage();
  if (!delivery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-details-dialog sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {delivery.taskId}
            </DialogTitle>
            <DeliveryStatusBadge status={delivery.status} />
            <PriorityBadge priority={delivery.priority} />
          </div>
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

        <div className="agrivo-assigned-details-grid">
          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("assignedDeliveries.modal.parties")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("assignedDeliveries.modal.farmer")}</dt>
                <dd>{delivery.farmerName}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.farmerContact")}</dt>
                <dd>{delivery.farmerPhone}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.buyer")}</dt>
                <dd>{delivery.buyerName}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.buyerContact")}</dt>
                <dd>{delivery.buyerPhone}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.buyerType")}</dt>
                <dd>{translateAssignedBuyerTypeValue(t, delivery)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("assignedDeliveries.modal.routeAndCargo")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("assignedDeliveries.modal.pickupAddress")}</dt>
                <dd>
                  {translateAssignedAddressValue(
                    t,
                    delivery.pickupAddress,
                    language,
                    delivery.pickupAddressLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.dropoffAddress")}</dt>
                <dd>
                  {translateAssignedAddressValue(
                    t,
                    delivery.dropoffAddress,
                    language,
                    delivery.dropoffAddressLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.product")}</dt>
                <dd>{translateAssignedProduct(t, language, delivery)}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.sort")}</dt>
                <dd>
                  <ProductVarietyBadge
                    variety={translateAssignedVariety(t, language, delivery.variety, delivery.sortKey)}
                    size="sm"
                    label={t("assignedDeliveries.modal.sort")}
                  />
                </dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.quantity")}</dt>
                <dd>{formatAssignedQuantity(delivery)}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.pickupTime")}</dt>
                <dd>{delivery.pickupTime}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.eta")}</dt>
                <dd>{delivery.eta}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.driver")}</dt>
                <dd>{delivery.driverName}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.vehicle")}</dt>
                <dd>{delivery.vehicle}</dd>
              </div>
              <div>
                <dt>{t("assignedDeliveries.modal.region")}</dt>
                <dd>{translateAssignedRegion(t, delivery.region)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {delivery.notes ? (
          <div className="agrivo-assigned-details-notes">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("assignedDeliveries.modal.notes")}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#33443a]">
              {translateAssignedNotes(t, delivery.notes)}
            </p>
          </div>
        ) : null}

        <section>
          <h4 className="agrivo-assigned-details-section-title">
            {t("assignedDeliveries.modal.deliveryTimeline")}
          </h4>
          <DeliveryTimeline status={delivery.status} />
        </section>

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
