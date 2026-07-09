import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ClipboardList, LoaderCircle, Truck } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { AssignedDeliverySummary } from "../../../utils/assignedDeliveriesStorage";

interface StatCard {
  labelKey: string;
  value: number;
  hintKey: string;
  icon: LucideIcon;
  accent: "total" | "pending" | "progress" | "priority";
}

export function AssignedDeliveryStats({ summary }: { summary: AssignedDeliverySummary }) {
  const { t } = useLanguage();

  const cards: StatCard[] = [
    {
      labelKey: "assignedDeliveries.stats.totalAssigned",
      value: summary.totalAssigned,
      hintKey: "assignedDeliveries.stats.activeDeliveryTasks",
      icon: ClipboardList,
      accent: "total",
    },
    {
      labelKey: "assignedDeliveries.stats.pendingPickup",
      value: summary.pendingPickup,
      hintKey: "assignedDeliveries.stats.awaitingFarmPickup",
      icon: Truck,
      accent: "pending",
    },
    {
      labelKey: "assignedDeliveries.stats.inProgress",
      value: summary.inProgress,
      hintKey: "assignedDeliveries.stats.onTheRoadNow",
      icon: LoaderCircle,
      accent: "progress",
    },
    {
      labelKey: "assignedDeliveries.stats.highPriority",
      value: summary.highPriority,
      hintKey: "assignedDeliveries.stats.needsAttentionFirst",
      icon: AlertTriangle,
      accent: "priority",
    },
  ];

  return (
    <section className="agrivo-assigned-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-assigned-stat-card agrivo-card agrivo-assigned-stat-card--${card.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-assigned-stat-icon">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <span className="agrivo-heading text-2xl font-bold text-[#102018]">{card.value}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[#102018]">{t(card.labelKey)}</p>
            <p className="mt-0.5 text-xs text-[#6b7a70]">{t(card.hintKey)}</p>
          </div>
        );
      })}
    </section>
  );
}
