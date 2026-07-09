import { ArrowRight } from "lucide-react";
import { ProductVarietyBadge } from "../../products/ProductVarietyBadge";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translatePickupLocation,
  translatePickupNotes,
  translatePickupProduct,
  translatePickupRegion,
  translatePickupVariety,
} from "../../../../i18n/pickupTasksHelpers";
import {
  formatPickupQuantity,
  type PickupTask,
  type PickupTaskAction,
} from "../../../utils/pickupTasksStorage";
import { PickupCardActions } from "./PickupCardActions";
import { PickupPriorityBadge } from "./PickupPriorityBadge";
import { PickupStatusBadge } from "./PickupStatusBadge";

interface PickupTaskCardProps {
  task: PickupTask;
  onAction: (task: PickupTask, action: PickupTaskAction) => void;
}

export function PickupTaskCard({ task, onAction }: PickupTaskCardProps) {
  const { t, language } = useLanguage();

  return (
    <article className="agrivo-pickup-card">
      <div className="agrivo-pickup-card__top">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a70]">
              {task.taskId}
            </p>
            <PickupPriorityBadge priority={task.priority} />
          </div>
          <p className="mt-1 text-xs text-[#6b7a70]">{task.assignedAt}</p>
        </div>
        <PickupStatusBadge status={task.status} />
      </div>

      <div className="agrivo-pickup-card__route">
        <h3 className="agrivo-heading flex flex-wrap items-center gap-1.5 text-base font-bold text-[#102018] sm:text-lg">
          <span>
            {translatePickupLocation(t, task.pickupLocation, language, task.pickupLocationLocalized)}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#43A047]" />
          <span>{translatePickupLocation(t, task.destination, language, task.destinationLocalized)}</span>
        </h3>
        <p className="mt-1 text-xs font-medium text-[#15803d]">
          {t("pickupTasks.card.pickupAt", { time: task.pickupTime })}
        </p>
      </div>

      <dl className="agrivo-pickup-card__details">
        <div>
          <dt>{t("pickupTasks.columns.farmer")}</dt>
          <dd>{task.farmerName}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.product")}</dt>
          <dd>{translatePickupProduct(t, language, task)}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.sort")}</dt>
          <dd>
            <ProductVarietyBadge
              variety={translatePickupVariety(t, language, task.variety, task.sortKey)}
              showLabel={false}
              size="sm"
            />
          </dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.quantity")}</dt>
          <dd>{formatPickupQuantity(task)}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.pickupWindow")}</dt>
          <dd>{task.pickupWindow}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.region")}</dt>
          <dd>{translatePickupRegion(t, task.region)}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.driver")}</dt>
          <dd>{task.driverName || t("pickupTasks.status.notAssigned")}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.vehicle")}</dt>
          <dd>{task.vehicle || "—"}</dd>
        </div>
        <div>
          <dt>{t("pickupTasks.columns.phone")}</dt>
          <dd>{task.farmerPhone}</dd>
        </div>
      </dl>

      {task.notes ? (
        <p className="agrivo-pickup-card__notes">
          {translatePickupNotes(t, task.notes, language, task.notesLocalized)}
        </p>
      ) : null}

      <PickupCardActions task={task} onAction={onAction} />
    </article>
  );
}
