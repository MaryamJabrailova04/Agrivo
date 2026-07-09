import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translateInTransitAddress,
  translateInTransitLocation,
  translateInTransitProduct,
  translateInTransitVariety,
} from "../../../../i18n/inTransitHelpers";
import {
  formatTransitQuantity,
  type InTransitDelivery,
} from "../../../utils/inTransitStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { EtaBadge } from "./EtaBadge";
import { TransitStatusBadge } from "./TransitStatusBadge";
import { TransitTimeline } from "./TransitTimeline";

export function TransitDetailsModal({
  delivery,
  open,
  onOpenChange,
}: {
  delivery: InTransitDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
            <TransitStatusBadge status={delivery.status} />
            <EtaBadge eta={delivery.eta} etaStatus={delivery.etaStatus} />
          </div>
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

        <div className="agrivo-assigned-details-grid">
          <section>
            <h4 className="agrivo-assigned-details-section-title">{t("inTransitPage.modal.shipment")}</h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("inTransitPage.columns.driver")}</dt>
                <dd>{delivery.driverName}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.modal.driverPhone")}</dt>
                <dd>{delivery.driverPhone}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.vehicle")}</dt>
                <dd>{delivery.vehicle}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.currentLocation")}</dt>
                <dd>
                  {translateInTransitLocation(
                    t,
                    delivery.currentLocation,
                    language,
                    delivery.currentLocationLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.distanceRemaining")}</dt>
                <dd>{delivery.distanceRemaining}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.progress")}</dt>
                <dd>{delivery.progress}%</dd>
              </div>
            </dl>
          </section>
          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("inTransitPage.modal.cargoAndParties")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("inTransitPage.modal.farmer")}</dt>
                <dd>{delivery.farmerName}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.modal.buyer")}</dt>
                <dd>{delivery.buyerName}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.modal.pickupAddress")}</dt>
                <dd>
                  {translateInTransitAddress(
                    t,
                    delivery.pickupAddress,
                    language,
                    delivery.pickupAddressLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("inTransitPage.modal.dropoffAddress")}</dt>
                <dd>
                  {translateInTransitAddress(
                    t,
                    delivery.dropoffAddress,
                    language,
                    delivery.dropoffAddressLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.product")}</dt>
                <dd>{translateInTransitProduct(t, language, delivery)}</dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.sort")}</dt>
                <dd>
                  <ProductVarietyBadge
                    variety={translateInTransitVariety(t, language, delivery.variety, delivery.sortKey)}
                    size="sm"
                    label={t("inTransitPage.columns.sort")}
                  />
                </dd>
              </div>
              <div>
                <dt>{t("inTransitPage.columns.quantity")}</dt>
                <dd>{formatTransitQuantity(delivery)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {delivery.notes || delivery.issue ? (
          <div className="agrivo-assigned-details-notes">
            {delivery.issue ? (
              <p className="text-sm font-semibold text-[#c2410c]">
                {t("inTransitPage.actions.reportIssue")}: {delivery.issue}
              </p>
            ) : null}
            {delivery.notes ? (
              <p className="mt-1 text-sm leading-6 text-[#33443a]">{delivery.notes}</p>
            ) : null}
          </div>
        ) : null}

        <section>
          <h4 className="agrivo-assigned-details-section-title">
            {t("inTransitPage.modal.deliveryTimeline")}
          </h4>
          <TransitTimeline status={delivery.status} />
        </section>

        <DialogFooter>
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
