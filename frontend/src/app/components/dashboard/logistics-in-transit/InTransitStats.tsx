import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Navigation,
  Truck,
} from "lucide-react";
import type { InTransitSummary } from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";

interface StatCard {
  labelKey: string;
  value: number;
  hintKey: string;
  icon: LucideIcon;
  accent: "active" | "ontime" | "delayed" | "near" | "issues";
}

export function InTransitStats({ summary }: { summary: InTransitSummary }) {
  const { t } = useLanguage();
  const cards: StatCard[] = [
    {
      labelKey: "inTransitPage.stats.activeTrips",
      value: summary.activeTrips,
      hintKey: "inTransitPage.stats.onTheRoadNow",
      icon: Truck,
      accent: "active",
    },
    {
      labelKey: "inTransitPage.stats.onTime",
      value: summary.onTime,
      hintKey: "inTransitPage.stats.withinEtaWindow",
      icon: CheckCircle2,
      accent: "ontime",
    },
    {
      labelKey: "inTransitPage.stats.delayed",
      value: summary.delayed,
      hintKey: "inTransitPage.stats.behindSchedule",
      icon: AlertTriangle,
      accent: "delayed",
    },
    {
      labelKey: "inTransitPage.stats.nearDestination",
      value: summary.nearDestination,
      hintKey: "inTransitPage.stats.approachingBuyer",
      icon: MapPin,
      accent: "near",
    },
    {
      labelKey: "inTransitPage.stats.issuesReported",
      value: summary.issuesReported,
      hintKey: "inTransitPage.stats.needsAttention",
      icon: Navigation,
      accent: "issues",
    },
  ];

  return (
    <section className="agrivo-transit-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.labelKey}
            className={`agrivo-transit-stat-card agrivo-card agrivo-transit-stat-card--${card.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-transit-stat-icon">
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
