import {
  CheckCircle2,
  MapPinPlus,
  MessageCircle,
  Phone,
  Truck,
} from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { Button } from "../../ui/button";

interface QuickActionsCardProps {
  onAssignPickup: () => void;
  onMarkPickedUp: () => void;
  onMarkInTransit: () => void;
  onMarkDelivered: () => void;
  onContactFarmer: () => void;
  onContactBuyer: () => void;
}

export function QuickActionsCard({
  onAssignPickup,
  onMarkPickedUp,
  onMarkInTransit,
  onMarkDelivered,
  onContactFarmer,
  onContactBuyer,
}: QuickActionsCardProps) {
  const { t } = useLanguage();

  const actions = [
    {
      labelKey: "logisticsDashboard.quickActions.assignNewPickup",
      icon: MapPinPlus,
      onClick: onAssignPickup,
      primary: true,
    },
    {
      labelKey: "logisticsDashboard.quickActions.markPickedUp",
      icon: Truck,
      onClick: onMarkPickedUp,
    },
    {
      labelKey: "logisticsDashboard.quickActions.markInTransit",
      icon: Truck,
      onClick: onMarkInTransit,
    },
    {
      labelKey: "logisticsDashboard.quickActions.markDelivered",
      icon: CheckCircle2,
      onClick: onMarkDelivered,
    },
    {
      labelKey: "logisticsDashboard.quickActions.contactFarmer",
      icon: Phone,
      onClick: onContactFarmer,
    },
    {
      labelKey: "logisticsDashboard.quickActions.contactBuyer",
      icon: MessageCircle,
      onClick: onContactBuyer,
    },
  ];

  return (
    <section className="agrivo-logistics-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("logisticsDashboard.quickActions.title")}
      </h3>
      <div className="agrivo-logistics-quick-actions mt-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.labelKey}
              type="button"
              variant={action.primary ? "default" : "outline"}
              className={
                action.primary
                  ? "agrivo-logistics-quick-action agrivo-logistics-quick-action--primary rounded-xl bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  : "agrivo-logistics-quick-action rounded-xl border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              }
              onClick={action.onClick}
            >
              <Icon className="mr-2 h-4 w-4 shrink-0" />
              {t(action.labelKey)}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
