import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Coins, Package, Star } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { FarmerProfileStats } from "../../../utils/farmerProfileStorage";

interface StatCard {
  labelKey: string;
  value: string;
  hintKey: string;
  icon: LucideIcon;
}

export function ProfileStats({ stats }: { stats: FarmerProfileStats }) {
  const { t } = useLanguage();

  const cards: StatCard[] = [
    {
      labelKey: "farmerDashboardProfile.stats.activeProducts",
      value: String(stats.activeProducts),
      hintKey: "farmerDashboardProfile.stats.listedInMarketplace",
      icon: Package,
    },
    {
      labelKey: "farmerDashboardProfile.stats.completedOrders",
      value: String(stats.completedOrders),
      hintKey: "farmerDashboardProfile.stats.deliveredToBuyers",
      icon: CheckCircle2,
    },
    {
      labelKey: "farmerDashboardProfile.stats.totalRevenue",
      value: `${stats.totalRevenue.toLocaleString("en-US")} AZN`,
      hintKey: "farmerDashboardProfile.stats.grossMarketplaceSales",
      icon: Coins,
    },
    {
      labelKey: "farmerDashboardProfile.stats.rating",
      value: stats.rating.toFixed(1),
      hintKey: "farmerDashboardProfile.stats.buyerSatisfaction",
      icon: Star,
    },
  ];

  return (
    <section className="agrivo-farmer-dash-profile-stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.labelKey} className="agrivo-farmer-dash-profile-stat-card agrivo-card">
            <div className="flex items-start justify-between gap-3">
              <div className="agrivo-farmer-dash-profile-stat-icon">
                <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={1.75} />
              </div>
              <span className="agrivo-heading text-xl font-bold text-[#102018] sm:text-2xl">
                {card.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[#102018]">{t(card.labelKey)}</p>
            <p className="mt-0.5 text-xs text-[#6b7a70]">{t(card.hintKey)}</p>
          </div>
        );
      })}
    </section>
  );
}
