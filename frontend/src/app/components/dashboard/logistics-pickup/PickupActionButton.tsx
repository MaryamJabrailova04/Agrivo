import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  Truck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import {
  type PickupTaskAction,
} from "../../../utils/pickupTasksStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translatePickupAction } from "../../../../i18n/pickupTasksHelpers";
import { cn } from "../../ui/utils";

export const pickupActionButtonVariants = cva(
  "agrivo-delivery-action inline-flex items-center justify-center gap-2 whitespace-nowrap border text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#86efac] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "agrivo-delivery-action--primary border-transparent bg-[#14532D] text-white shadow-[0_4px_14px_rgba(20,83,45,0.22)] hover:bg-[#1D6A3B] hover:shadow-[0_6px_18px_rgba(20,83,45,0.28)]",
        secondary:
          "agrivo-delivery-action--secondary border-[#cfe3c8] bg-[#f8fcf6] text-[#14532D] hover:border-[#86efac] hover:bg-[#EAF7EC]",
        danger:
          "agrivo-delivery-action--danger border-[#fecaca] bg-[#fff7f7] text-[#b91c1c] hover:border-[#fca5a5] hover:bg-[#fef2f2]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

const ACTION_ICONS: Record<PickupTaskAction, LucideIcon> = {
  assign_driver: UserPlus,
  start_pickup: Package,
  mark_collected: PackageCheck,
  mark_resolved: CheckCircle2,
  report_delay: AlertCircle,
  move_to_in_transit: Truck,
  view_details: Eye,
  open_route: Navigation,
  contact_farmer: Phone,
};

export interface PickupActionButtonProps
  extends Omit<ComponentProps<"button">, "children">,
    VariantProps<typeof pickupActionButtonVariants> {
  action: PickupTaskAction;
  label?: string;
}

export function PickupActionButton({
  action,
  label,
  variant,
  className,
  type = "button",
  ...props
}: PickupActionButtonProps) {
  const { t } = useLanguage();
  const Icon = ACTION_ICONS[action];

  return (
    <button
      type={type}
      className={cn(pickupActionButtonVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <span>{label ?? translatePickupAction(t, action)}</span>
    </button>
  );
}
