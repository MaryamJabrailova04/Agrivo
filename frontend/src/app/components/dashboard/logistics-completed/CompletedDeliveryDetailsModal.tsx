import { Camera, FileCheck, PenLine } from "lucide-react";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import {
  formatCompletedQuantity,
  type CompletedDelivery,
} from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatCompletedRouteLabel,
  translateCompletedAddress,
  translateCompletedProduct,
  translateCompletedVariety,
  translateDeliveryFeedback,
  translateProofStatus,
} from "../../../../i18n/completedDeliveriesHelpers";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { CompletedDeliveryTimeline } from "./CompletedDeliveryTimeline";
import { CompletionStatusBadge } from "./CompletionStatusBadge";
import { RatingDisplay } from "./RatingDisplay";

export function CompletedDeliveryDetailsModal({
  delivery,
  open,
  onOpenChange,
  onDownloadReceipt,
}: {
  delivery: CompletedDelivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadReceipt: (delivery: CompletedDelivery) => void;
}) {
  const { t, language } = useLanguage();
  if (!delivery) return null;

  const hasProof = delivery.proofStatus !== "none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-details-dialog sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {delivery.taskId}
            </DialogTitle>
            <CompletionStatusBadge status={delivery.status} />
            <RatingDisplay rating={delivery.rating} showEmpty />
          </div>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {formatCompletedRouteLabel(t, delivery, language)}
          </DialogDescription>
        </DialogHeader>

        <div className="agrivo-assigned-details-grid">
          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("completedDeliveries.modal.partiesAndVehicle")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("completedDeliveries.modal.farmer")}</dt>
                <dd>{delivery.farmerName}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.buyer")}</dt>
                <dd>{delivery.buyerName}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.table.driver")}</dt>
                <dd>{delivery.driverName}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.vehicle")}</dt>
                <dd>{delivery.vehicle}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.pickupAddress")}</dt>
                <dd>
                  {translateCompletedAddress(
                    t,
                    delivery.pickupAddress,
                    language,
                    delivery.pickupAddressLocalized,
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.dropoffAddress")}</dt>
                <dd>
                  {translateCompletedAddress(
                    t,
                    delivery.dropoffAddress,
                    language,
                    delivery.dropoffAddressLocalized,
                  )}
                </dd>
              </div>
            </dl>
          </section>
          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("completedDeliveries.modal.deliveryRecord")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("completedDeliveries.table.product")}</dt>
                <dd>{translateCompletedProduct(t, language, delivery)}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.sort")}</dt>
                <dd>
                  <ProductVarietyBadge
                    variety={translateCompletedVariety(t, language, delivery.variety, delivery.sortKey)}
                    size="sm"
                    label={t("completedDeliveries.modal.sort")}
                  />
                </dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.table.quantity")}</dt>
                <dd>{formatCompletedQuantity(delivery)}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.pickupTime")}</dt>
                <dd>{delivery.pickupTime}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.completedAt")}</dt>
                <dd>{delivery.completedAt}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.totalDuration")}</dt>
                <dd>{delivery.deliveryDuration}</dd>
              </div>
              <div>
                <dt>{t("completedDeliveries.modal.distance")}</dt>
                <dd>{delivery.distance}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="agrivo-completed-proof-section">
          <h4 className="agrivo-assigned-details-section-title">
            {t("completedDeliveries.modal.deliveryProof")}
          </h4>
          {hasProof ? (
            <div className="agrivo-completed-proof-card">
              <div className="agrivo-completed-proof-thumb">
                <Camera className="h-8 w-8 text-[#86efac]" />
                <span>{t("completedDeliveries.modal.proofThumbnail")}</span>
              </div>
              <dl className="agrivo-assigned-details-list">
                <div>
                  <dt>{t("completedDeliveries.modal.proofType")}</dt>
                  <dd>{translateProofStatus(t, delivery.proofStatus)}</dd>
                </div>
                <div>
                  <dt>{t("completedDeliveries.modal.receivedBy")}</dt>
                  <dd>{delivery.receivedBy}</dd>
                </div>
                <div>
                  <dt>{t("completedDeliveries.modal.completedAt")}</dt>
                  <dd>{delivery.completedAt}</dd>
                </div>
                <div>
                  <dt>{t("completedDeliveries.modal.signature")}</dt>
                  <dd className="flex items-center gap-1">
                    {delivery.proofStatus === "photo_signature" ||
                    delivery.proofStatus === "signature" ? (
                      <>
                        <PenLine className="h-3.5 w-3.5 text-[#16a34a]" />{" "}
                        {t("completedDeliveries.modal.received")}
                      </>
                    ) : (
                      t("completedDeliveries.modal.notRequired")
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="agrivo-completed-proof-warning">
              <FileCheck className="h-4 w-4 shrink-0" />
              {t("completedDeliveries.modal.noProofUploaded")}
            </p>
          )}
        </section>

        {delivery.feedback ? (
          <div className="agrivo-assigned-details-notes">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("completedDeliveries.modal.buyerFeedback")}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#33443a]">
              &ldquo;{translateDeliveryFeedback(t, delivery)}&rdquo;
            </p>
          </div>
        ) : null}

        {delivery.issue || delivery.notes ? (
          <div className="agrivo-assigned-details-notes">
            {delivery.issue ? (
              <p className="text-sm font-semibold text-[#c2410c]">
                {t("completedDeliveries.modal.issue")}: {delivery.issue}
              </p>
            ) : null}
            {delivery.notes ? (
              <p className="mt-1 text-sm text-[#33443a]">{delivery.notes}</p>
            ) : null}
          </div>
        ) : null}

        <section>
          <h4 className="agrivo-assigned-details-section-title">
            {t("completedDeliveries.modal.deliveryTimeline")}
          </h4>
          <CompletedDeliveryTimeline />
        </section>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => onDownloadReceipt(delivery)}
          >
            {t("completedDeliveries.actions.downloadReceipt")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={() => onOpenChange(false)}
          >
            {t("completedDeliveries.actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
