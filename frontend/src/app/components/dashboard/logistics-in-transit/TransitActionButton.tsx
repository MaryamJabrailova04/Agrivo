import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  MapPin,
  Navigation,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import {
  type InTransitAction,
} from "../../../utils/inTransitStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateInTransitAction } from "../../../../i18n/inTransitHelpers";
import { cn } from "../../ui/utils";

export const transitActionButtonVariants = cva(
  "agrivo-delivery-action inline-flex items-center justify-center gap-2 whitespace-nowrap border text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#86efac] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "agrivo-delivery-action--primary border-transparent bg-[#14532D] text-white shadow-[0_4px_14px_rgba(20,83,45,0.22)] hover:bg-[#1D6A3B]",
        secondary:
          "agrivo-delivery-action--secondary border-[#cfe3c8] bg-[#f8fcf6] text-[#14532D] hover:border-[#86efac] hover:bg-[#EAF7EC]",
        danger:
          "agrivo-delivery-action--danger border-[#fecaca] bg-[#fff7f7] text-[#b91c1c] hover:border-[#fca5a5] hover:bg-[#fef2f2]",
      },
    },
    defaultVariants: { variant: "secondary" },
  },
);

const ACTION_ICONS: Record<InTransitAction, LucideIcon> = {
  mark_delivered: CheckCircle2,
  resolve_issue: AlertCircle,
  confirm_arrival: MapPin,
  view_details: Eye,
  open_route: Navigation,
  contact_driver: Phone,
  report_issue: AlertCircle,
  notify_buyer: Bell,
};

export function TransitActionButton({
  action,
  label,
  variant,
  className,
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "children"> &
  VariantProps<typeof transitActionButtonVariants> & {
    action: InTransitAction;
    label?: string;
  }) {
  const { t } = useLanguage();
  const Icon = ACTION_ICONS[action];
  return (
    <button
      type={type}
      className={cn(transitActionButtonVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden />
      <span>{label ?? translateInTransitAction(t, action)}</span>
    </button>
  );
}
