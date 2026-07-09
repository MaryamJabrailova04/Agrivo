import { Clock3, MapPin, Package, Truck, Users } from "lucide-react";
import type { LogisticsProfileStats } from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";

const STAT_CARDS = [
  {
    key: "totalDeliveries" as const,
    labelKey: "logisticsProfile.stats.totalDeliveries",
    hintKey: "logisticsProfile.stats.completedShipments",
    icon: Package,
    tone: "green",
  },
  {
    key: "activeDrivers" as const,
    labelKey: "logisticsProfile.stats.activeDrivers",
    hintKey: "logisticsProfile.stats.onYourTeam",
    icon: Users,
    tone: "neutral",
  },
  {
    key: "fleetSize" as const,
    labelKey: "logisticsProfile.stats.fleetSize",
    hintKey: "logisticsProfile.stats.registeredVehicles",
    icon: Truck,
    tone: "teal",
  },
  {
    key: "serviceRegions" as const,
    labelKey: "logisticsProfile.stats.serviceRegions",
    hintKey: "logisticsProfile.stats.coverageAreas",
    icon: MapPin,
    tone: "blue",
  },
  {
    key: "onTimeRate" as const,
    labelKey: "logisticsProfile.stats.onTimeRate",
    hintKey: "logisticsProfile.stats.deliveryPerformance",
    icon: Clock3,
    tone: "ontime",
  },
];

export function LogisticsProfileStats({ stats }: { stats: LogisticsProfileStats }) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-logistics-profile-stats">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value =
          card.key === "onTimeRate" ? `${stats[card.key]}%` : String(stats[card.key]);

        return (
          <div
            key={card.labelKey}
            className={`agrivo-logistics-profile-stat-card agrivo-logistics-profile-stat-card--${card.tone}`}
          >
            <div className="agrivo-logistics-profile-stat-icon">
              <Icon className="h-4 w-4" />
            </div>
            <p className="agrivo-logistics-profile-stat-value">{value}</p>
            <p className="agrivo-logistics-profile-stat-label">{t(card.labelKey)}</p>
            <p className="agrivo-logistics-profile-stat-hint">{t(card.hintKey)}</p>
          </div>
        );
      })}
    </section>
  );
}
