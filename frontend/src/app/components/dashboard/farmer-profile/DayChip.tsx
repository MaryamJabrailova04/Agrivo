import { Check } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import type { WeekDay } from "../../../utils/workingSchedule";
import { cn } from "../../ui/utils";

export function DayChip({
  day,
  selected,
  disabled = false,
  onClick,
}: {
  day: WeekDay;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={cn(
        "agrivo-schedule-day-chip",
        selected && "agrivo-schedule-day-chip--selected",
        disabled && "agrivo-schedule-day-chip--disabled",
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected ? <Check className="agrivo-schedule-day-chip__icon" aria-hidden /> : null}
      <span>{t(`farmerDashboardProfile.weekdaysShort.${day}`)}</span>
    </button>
  );
}
