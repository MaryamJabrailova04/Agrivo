import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Route,
  Truck,
} from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { LogisticsOverviewSummary } from "../../../utils/logisticsDashboardStorage";

interface StatCard {
  labelKey: string;
  value: number;
  hintKey: string;
  icon: LucideIcon;
  accent: string;
}

export function OverviewStats({ summary }: { summary: LogisticsOverviewSummary }) {
  const { t } = useLanguage();

  const cards: StatCard[] = [
    {
      labelKey: "delivery.logistics.todaysDeliveries",
      value: summary.assignedToday,
      hintKey: "logisticsDashboard.stats.tasksScheduled",
      icon: ClipboardList,
      accent: "assigned",
    },
    {
      labelKey: "delivery.logistics.pendingOrders",
      value: summary.pickupPending,
      hintKey: "logisticsDashboard.stats.awaitingFarmHandoff",
      icon: MapPin,
      accent: "pickup",
    },
    {
      labelKey: "logisticsDashboard.stats.inTransit",
      value: summary.inTransit,
      hintKey: "logisticsDashboard.stats.onTheRoadNow",
      icon: Truck,
      accent: "transit",
    },
    {
      labelKey: "delivery.logistics.completedDeliveries",
      value: summary.completedToday,
      hintKey: "logisticsDashboard.stats.deliveredSuccessfully",
      icon: CheckCircle2,
      accent: "completed",
    },
    {
      labelKey: "logisticsDashboard.stats.delayedDeliveries",
      value: summary.delayed,
      hintKey: "logisticsDashboard.stats.needsAttention",
      icon: AlertTriangle,
      accent: "delayed",
    },
    {
      labelKey: "delivery.logistics.avgDeliveryTime",
      value: summary.totalStops > 0 ? Math.max(1, Math.round(summary.totalStops * 0.4)) : 0,
      hintKey: "delivery.logistics.performance",
      icon: Route,
      accent: "stops",
    },
  ];

  return (
    <section className="agrivo-logistics-overview-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-logistics-overview-stat agrivo-logistics-overview-stat--${card.accent}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="agrivo-logistics-overview-stat-icon">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="agrivo-heading text-2xl font-bold text-[#102018]">{card.value}</span>
            </div>
            <p className="mt-2.5 text-sm font-semibold text-[#102018]">{t(card.labelKey)}</p>
            <p className="mt-0.5 text-xs text-[#6b7a70]">{t(card.hintKey)}</p>
          </div>
        );
      })}
    </section>
  );
}
