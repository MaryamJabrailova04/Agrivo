import { useMemo } from "react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { formatLocalizedScheduleSummary } from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  SCHEDULE_PRESETS,
  WEEKDAY_ORDER,
  applySchedulePreset,
  detectSchedulePreset,
  toggleWorkingDay,
  validateSchedule,
  type WeekDay,
} from "../../../utils/workingSchedule";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { DayChip } from "./DayChip";
import { SchedulePresetButton } from "./SchedulePresetButton";

interface WorkingSchedulePickerProps {
  workingDays: WeekDay[];
  openingTime: string;
  closingTime: string;
  isEditing: boolean;
  errors?: Record<string, string>;
  onChange: (updates: {
    workingDays?: WeekDay[];
    openingTime?: string;
    closingTime?: string;
  }) => void;
}

export function WorkingSchedulePicker({
  workingDays,
  openingTime,
  closingTime,
  isEditing,
  errors = {},
  onChange,
}: WorkingSchedulePickerProps) {
  const { t, language } = useLanguage();
  const activePreset = useMemo(() => detectSchedulePreset(workingDays), [workingDays]);
  const summary = useMemo(
    () => formatLocalizedScheduleSummary(t, language, workingDays, openingTime, closingTime),
    [t, language, workingDays, openingTime, closingTime],
  );
  const liveErrors = useMemo(
    () => validateSchedule(workingDays, openingTime, closingTime),
    [workingDays, openingTime, closingTime],
  );

  const displayErrors = { ...liveErrors, ...errors };

  const presetLabels: Record<(typeof SCHEDULE_PRESETS)[number]["id"], string> = {
    every_day: t("farmerDashboardProfile.schedule.presets.everyDay"),
    mon_fri: t("farmerDashboardProfile.schedule.presets.monFri"),
    mon_sat: t("farmerDashboardProfile.schedule.presets.monSat"),
    custom: t("farmerDashboardProfile.schedule.presets.custom"),
  };

  const handlePresetClick = (preset: (typeof SCHEDULE_PRESETS)[number]["id"]) => {
    if (preset === "custom") return;
    onChange({ workingDays: applySchedulePreset(preset) });
  };

  const handleDayToggle = (day: WeekDay) => {
    onChange({ workingDays: toggleWorkingDay(workingDays, day) });
  };

  if (!isEditing) {
    return <p className="agrivo-schedule-summary">{summary}</p>;
  }

  return (
    <div className="agrivo-working-schedule-picker">
      <div className="agrivo-working-schedule-picker__presets">
        {SCHEDULE_PRESETS.map((preset) => (
          <SchedulePresetButton
            key={preset.id}
            label={presetLabels[preset.id]}
            active={activePreset === preset.id}
            onClick={() => handlePresetClick(preset.id)}
          />
        ))}
      </div>

      <div className="agrivo-working-schedule-picker__days">
        {WEEKDAY_ORDER.map((day) => (
          <DayChip
            key={day}
            day={day}
            selected={workingDays.includes(day)}
            onClick={() => handleDayToggle(day)}
          />
        ))}
      </div>

      <div className="agrivo-working-schedule-picker__times">
        <div>
          <Label htmlFor="opening-time">{t("farmerDashboardProfile.fields.openingTime")}</Label>
          <Input
            id="opening-time"
            type="time"
            value={openingTime}
            onChange={(event) => onChange({ openingTime: event.target.value })}
            className="mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm"
          />
        </div>
        <div>
          <Label htmlFor="closing-time">{t("farmerDashboardProfile.fields.closingTime")}</Label>
          <Input
            id="closing-time"
            type="time"
            value={closingTime}
            onChange={(event) => onChange({ closingTime: event.target.value })}
            className="mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm"
          />
          {displayErrors.closingTime ? (
            <p className="agrivo-profile-field-error">{displayErrors.closingTime}</p>
          ) : null}
        </div>
      </div>

      <p className="agrivo-schedule-summary">{summary}</p>

      {displayErrors.workingDays ? (
        <p className="agrivo-profile-field-error">{displayErrors.workingDays}</p>
      ) : null}
    </div>
  );
}
