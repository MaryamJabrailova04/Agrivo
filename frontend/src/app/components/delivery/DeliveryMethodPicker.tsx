import { Check, MapPin, Tractor, Truck, type LucideIcon } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatDeliveryFee,
  translateDeliveryMethod,
  translateDeliveryMethodDesc,
} from "../../../i18n/deliveryHelpers";
import type { DeliveryMethod, DeliveryMethodQuote } from "../../data/deliveryTypes";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

const METHOD_ICONS: Record<DeliveryMethod, LucideIcon> = {
  farmer_delivery: Tractor,
  agrivo_logistics: Truck,
  self_pickup: MapPin,
};

interface DeliveryMethodPickerProps {
  quotes: DeliveryMethodQuote[];
  selected: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
  compact?: boolean;
  className?: string;
}

function getMetaRows(
  quote: DeliveryMethodQuote,
  t: (key: string, fallback?: string) => string,
): Array<{ label: string; value: string }> {
  const feeValue =
    quote.fee <= 0 ? t("delivery.free", "Free") : formatDeliveryFee(quote.fee);

  if (quote.method === "farmer_delivery") {
    return [
      { label: t("delivery.fee", "Fee"), value: feeValue },
      { label: t("delivery.eta", "ETA"), value: quote.estimatedTimeLabel },
      {
        label: t("delivery.radius", "Radius"),
        value: quote.meta?.radiusKm ? `${quote.meta.radiusKm} km` : "—",
      },
    ];
  }

  if (quote.method === "agrivo_logistics") {
    return [
      { label: t("delivery.fee", "Fee"), value: feeValue },
      { label: t("delivery.eta", "ETA"), value: quote.estimatedTimeLabel },
      {
        label: t("delivery.tracking", "Tracking"),
        value: t("delivery.trackingIncluded", "Included"),
      },
    ];
  }

  return [
    { label: t("delivery.fee", "Fee"), value: feeValue },
    {
      label: t("delivery.pickupReady", "Pickup Ready"),
      value: quote.meta?.prepMinutes
        ? `${quote.meta.prepMinutes} ${t("delivery.minutes", "min")}`
        : quote.estimatedTimeLabel,
    },
    {
      label: t("delivery.farmLocation", "Farm Location"),
      value: t("delivery.farmLocationAvailable", "Available"),
    },
  ];
}

export function DeliveryMethodPicker({
  quotes,
  selected,
  onSelect,
  compact = false,
  className,
}: DeliveryMethodPickerProps) {
  const { t } = useLanguage();
  const firstEnabledMethod = quotes.find((item) => item.enabled)?.method ?? null;

  return (
    <div
      className={cn(
        "agrivo-delivery-method-picker",
        compact && "agrivo-delivery-method-picker--compact",
        className,
      )}
    >
      <h3
        className={cn(
          "agrivo-heading font-bold text-[#102018]",
          compact ? "text-base" : "text-lg",
        )}
        id="delivery-method-heading"
      >
        {t("delivery.methodTitle", "Delivery Method")}
      </h3>
      {!compact ? (
        <p className="agrivo-delivery-method-picker__subtitle">
          {t("delivery.methodSubtitle", "Choose how you want to receive your order.")}
        </p>
      ) : null}

      <div
        className="agrivo-delivery-method-grid"
        role="radiogroup"
        aria-labelledby="delivery-method-heading"
      >
        {quotes.map((quote) => {
          const Icon = METHOD_ICONS[quote.method];
          const isSelected = selected === quote.method;
          const disabled = !quote.enabled;
          const isTabStop =
            !disabled &&
            (isSelected || (selected === null && quote.method === firstEnabledMethod));
          const title = translateDeliveryMethod(t, quote.method);
          const description =
            translateDeliveryMethodDesc(t, quote.method) || quote.shortDescription;
          const metaRows = getMetaRows(quote, t);
          const ariaLabel = [
            title,
            description,
            ...metaRows.map((row) => `${row.label}: ${row.value}`),
            disabled
              ? t("delivery.unavailable", "Unavailable")
              : isSelected
                ? t("delivery.selected", "Selected")
                : t("delivery.select", "Select"),
          ].join(". ");

          return (
            <div
              key={quote.method}
              role="radio"
              tabIndex={isTabStop ? 0 : -1}
              aria-checked={isSelected}
              aria-disabled={disabled || undefined}
              aria-label={ariaLabel}
              data-method={quote.method}
              className={cn(
                "agrivo-delivery-method-card",
                isSelected && "agrivo-delivery-method-card--selected",
                disabled && "agrivo-delivery-method-card--disabled",
              )}
              onClick={() => {
                if (!disabled) onSelect(quote.method);
              }}
              onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(quote.method);
                }
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  const next = focusAdjacentCard(event.currentTarget, 1);
                  const nextMethod = next?.dataset.method as DeliveryMethod | undefined;
                  if (nextMethod) onSelect(nextMethod);
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const next = focusAdjacentCard(event.currentTarget, -1);
                  const nextMethod = next?.dataset.method as DeliveryMethod | undefined;
                  if (nextMethod) onSelect(nextMethod);
                }
              }}
            >
              <div className="agrivo-delivery-method-card__top">
                <span className="agrivo-delivery-method-card__icon" aria-hidden="true">
                  <Icon />
                </span>
                {isSelected ? (
                  <span className="agrivo-delivery-method-card__badge">
                    <Check className="agrivo-delivery-method-card__badge-icon" aria-hidden="true" />
                    {t("delivery.selected", "Selected")}
                  </span>
                ) : null}
              </div>

              <div className="agrivo-delivery-method-card__body">
                <p className="agrivo-delivery-method-card__title">{title}</p>
                <p className="agrivo-delivery-method-card__description">{description}</p>

                <dl className="agrivo-delivery-method-card__meta">
                  {metaRows.map((row) => (
                    <div key={row.label} className="agrivo-delivery-method-card__meta-row">
                      <dt>{row.label}</dt>
                      <dd title={row.value}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="agrivo-delivery-method-card__footer">
                <span
                  className={cn(
                    "agrivo-delivery-method-card__action",
                    isSelected && "agrivo-delivery-method-card__action--selected",
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check className="agrivo-delivery-method-card__action-icon" aria-hidden="true" />
                      {t("delivery.selected", "Selected")}
                    </>
                  ) : (
                    t("delivery.select", "Select")
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function focusAdjacentCard(current: HTMLElement, direction: 1 | -1): HTMLElement | null {
  const group = current.parentElement;
  if (!group) return null;
  const cards = Array.from(
    group.querySelectorAll<HTMLElement>('[role="radio"]:not([aria-disabled="true"])'),
  );
  const index = cards.indexOf(current);
  if (index < 0 || cards.length === 0) return null;
  const next = cards[(index + direction + cards.length) % cards.length];
  next?.focus();
  return next ?? null;
}

interface DeliveryMethodSummaryProps {
  method: DeliveryMethod | null;
  fee: number;
  className?: string;
}

export function DeliveryMethodSummary({ method, fee, className }: DeliveryMethodSummaryProps) {
  const { t } = useLanguage();
  if (!method) return null;
  return (
    <div className={cn("rounded-2xl border border-[#e5efe1] bg-[#f6fbf4] px-4 py-3 text-sm", className)}>
      <p className="font-semibold text-[#14532D]">{translateDeliveryMethod(t, method)}</p>
      <p className="mt-1 text-[#5F6F64]">
        {t("delivery.fee", "Fee")}: {formatDeliveryFee(fee)}
      </p>
    </div>
  );
}

export function DeliveryConfirmButton({
  disabled,
  onClick,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  const { t } = useLanguage();
  return (
    <Button
      type="button"
      disabled={disabled}
      className="h-11 w-full rounded-full bg-[#14532D] text-sm font-semibold text-white hover:bg-[#1b6b3f]"
      onClick={onClick}
    >
      {label ?? t("delivery.continuePayment", "Continue Payment")}
    </Button>
  );
}
