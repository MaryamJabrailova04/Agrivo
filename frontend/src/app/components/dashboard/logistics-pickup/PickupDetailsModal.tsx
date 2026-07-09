import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translatePickupAddress,
  translatePickupLocation,
  translatePickupNotes,
  translatePickupProduct,
  translatePickupRegion,
  translatePickupVariety,
} from "../../../../i18n/pickupTasksHelpers";
import {
  formatPickupQuantity,
  type PickupTask,
} from "../../../utils/pickupTasksStorage";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { PickupPriorityBadge } from "./PickupPriorityBadge";
import { PickupStatusBadge } from "./PickupStatusBadge";
import { PickupTimeline } from "./PickupTimeline";

interface PickupDetailsModalProps {
  task: PickupTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PickupDetailsModal({ task, open, onOpenChange }: PickupDetailsModalProps) {
  const { t, language } = useLanguage();
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="agrivo-assigned-details-dialog sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {task.taskId}
            </DialogTitle>
            <PickupStatusBadge status={task.status} />
            <PickupPriorityBadge priority={task.priority} />
          </div>
          <DialogDescription className="text-sm text-[#5F6F64]">
            {translatePickupLocation(t, task.pickupLocation, language, task.pickupLocationLocalized)} →{" "}
            {translatePickupLocation(t, task.destination, language, task.destinationLocalized)}
          </DialogDescription>
        </DialogHeader>

        <div className="agrivo-assigned-details-grid">
          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("pickupTasks.modal.farmAndContact")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("pickupTasks.modal.farmerFarm")}</dt>
                <dd>{task.farmerName}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.phone")}</dt>
                <dd>{task.farmerPhone}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.modal.pickupAddress")}</dt>
                <dd>{translatePickupAddress(t, task.pickupAddress, language, task.pickupAddressLocalized)}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.modal.destination")}</dt>
                <dd>{translatePickupLocation(t, task.destination, language, task.destinationLocalized)}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.region")}</dt>
                <dd>
                  {translatePickupRegion(t, task.region)} · {task.district}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 className="agrivo-assigned-details-section-title">
              {t("pickupTasks.modal.collectionDetails")}
            </h4>
            <dl className="agrivo-assigned-details-list">
              <div>
                <dt>{t("pickupTasks.columns.product")}</dt>
                <dd>{translatePickupProduct(t, language, task)}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.sort")}</dt>
                <dd>
                  <ProductVarietyBadge
                    variety={translatePickupVariety(t, language, task.variety, task.sortKey)}
                    size="sm"
                    label={t("pickupTasks.columns.sort")}
                  />
                </dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.quantity")}</dt>
                <dd>{formatPickupQuantity(task)}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.modal.pickupTime")}</dt>
                <dd>{task.pickupTime}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.pickupWindow")}</dt>
                <dd>{task.pickupWindow}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.driver")}</dt>
                <dd>{task.driverName || t("pickupTasks.status.notAssigned")}</dd>
              </div>
              <div>
                <dt>{t("pickupTasks.columns.vehicle")}</dt>
                <dd>{task.vehicle || "—"}</dd>
              </div>
            </dl>
          </section>
        </div>

        {task.notes ? (
          <div className="agrivo-assigned-details-notes">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("pickupTasks.modal.notes")}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#33443a]">
              {translatePickupNotes(t, task.notes, language, task.notesLocalized)}
            </p>
          </div>
        ) : null}

        <section>
          <h4 className="agrivo-assigned-details-section-title">
            {t("pickupTasks.modal.pickupChecklistTimeline")}
          </h4>
          <PickupTimeline status={task.status} />
        </section>

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
