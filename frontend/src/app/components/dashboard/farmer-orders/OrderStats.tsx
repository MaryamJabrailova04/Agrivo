import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ClipboardList, Clock3, ChefHat } from "lucide-react";
import type { FarmerOrdersSummary } from "../../../utils/farmerOrdersStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";

interface StatCard {
  labelKey: string;
  value: number;
  hintKey: string;
  icon: LucideIcon;
  accent?: "default" | "pending" | "preparing" | "completed";
}

export function OrderStats({ summary }: { summary: FarmerOrdersSummary }) {
  const { t } = useLanguage();

  const cards: StatCard[] = [
    {
      labelKey: "farmerOrders.stats.totalOrders",
      value: summary.total,
      hintKey: "farmerOrders.stats.allBuyerRequests",
      icon: ClipboardList,
      accent: "default",
    },
    {
      labelKey: "farmerOrders.stats.pendingOrders",
      value: summary.pending,
      hintKey: "farmerOrders.stats.awaitingConfirmation",
      icon: Clock3,
      accent: "pending",
    },
    {
      labelKey: "farmerOrders.stats.preparing",
      value: summary.preparing,
      hintKey: "farmerOrders.stats.inProgressNow",
      icon: ChefHat,
      accent: "preparing",
    },
    {
      labelKey: "farmerOrders.stats.completed",
      value: summary.completed,
      hintKey: "farmerOrders.stats.deliveredOrders",
      icon: CheckCircle2,
      accent: "completed",
    },
  ];

  return (
    <section className="agrivo-farmer-order-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-farmer-order-stat-card agrivo-card agrivo-farmer-order-stat-card--${card.accent ?? "default"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-farmer-order-stat-icon">
                <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={1.75} />
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
