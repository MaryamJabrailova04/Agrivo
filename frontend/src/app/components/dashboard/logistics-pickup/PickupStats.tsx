import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { PickupTaskSummary } from "../../../utils/pickupTasksStorage";

interface StatCard {
  labelKey: string;
  value: number;
  hintKey: string;
  icon: LucideIcon;
  accent: "today" | "scheduled" | "ready" | "delayed" | "completed";
}

export function PickupStats({ summary }: { summary: PickupTaskSummary }) {
  const { t } = useLanguage();
  const cards: StatCard[] = [
    {
      labelKey: "pickupTasks.stats.todaysPickups",
      value: summary.todaysPickups,
      hintKey: "pickupTasks.stats.scheduledForToday",
      icon: CalendarClock,
      accent: "today",
    },
    {
      labelKey: "pickupTasks.stats.scheduled",
      value: summary.scheduled,
      hintKey: "pickupTasks.stats.awaitingCollection",
      icon: Clock3,
      accent: "scheduled",
    },
    {
      labelKey: "pickupTasks.stats.readyForPickup",
      value: summary.readyForPickup,
      hintKey: "pickupTasks.stats.packedAndWaiting",
      icon: PackageCheck,
      accent: "ready",
    },
    {
      labelKey: "pickupTasks.stats.delayedPickups",
      value: summary.delayed,
      hintKey: "pickupTasks.stats.needsAttention",
      icon: AlertTriangle,
      accent: "delayed",
    },
    {
      labelKey: "pickupTasks.stats.completedPickups",
      value: summary.completed,
      hintKey: "pickupTasks.stats.collectedToday",
      icon: CheckCircle2,
      accent: "completed",
    },
  ];

  return (
    <section className="agrivo-pickup-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-pickup-stat-card agrivo-card agrivo-pickup-stat-card--${card.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-pickup-stat-icon">
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
