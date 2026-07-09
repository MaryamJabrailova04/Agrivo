import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CheckCircle2,
  Scale,
  Star,
  TrendingUp,
} from "lucide-react";
import type { CompletedSummary } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatDeliveredWeightLocalized } from "../../../../i18n/completedDeliveriesHelpers";

interface StatCard {
  labelKey: string;
  value: string;
  hintKey: string;
  icon: LucideIcon;
  accent: "today" | "week" | "weight" | "ontime" | "rating";
}

export function CompletedDeliveryStats({ summary }: { summary: CompletedSummary }) {
  const { t } = useLanguage();
  const cards: StatCard[] = [
    {
      labelKey: "completedDeliveries.stats.completedToday",
      value: String(summary.completedToday),
      hintKey: "completedDeliveries.stats.deliveredToday",
      icon: CheckCircle2,
      accent: "today",
    },
    {
      labelKey: "completedDeliveries.stats.completedThisWeek",
      value: String(summary.completedThisWeek),
      hintKey: "completedDeliveries.stats.last7Days",
      icon: CalendarCheck,
      accent: "week",
    },
    {
      labelKey: "completedDeliveries.stats.totalDeliveredWeight",
      value: formatDeliveredWeightLocalized(t, summary.totalDeliveredWeightKg),
      hintKey: "completedDeliveries.stats.allRecords",
      icon: Scale,
      accent: "weight",
    },
    {
      labelKey: "completedDeliveries.stats.onTimeRate",
      value: `${summary.onTimeRate}%`,
      hintKey: "completedDeliveries.stats.deliveryPunctuality",
      icon: TrendingUp,
      accent: "ontime",
    },
    {
      labelKey: "completedDeliveries.stats.averageRating",
      value: summary.averageRating.toFixed(1),
      hintKey: "completedDeliveries.stats.buyerSatisfaction",
      icon: Star,
      accent: "rating",
    },
  ];

  return (
    <section className="agrivo-completed-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-completed-stat-card agrivo-card agrivo-completed-stat-card--${card.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-completed-stat-icon">
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
