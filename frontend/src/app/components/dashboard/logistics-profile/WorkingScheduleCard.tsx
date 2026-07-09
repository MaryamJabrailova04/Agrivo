import { CalendarClock } from "lucide-react";
import type { LogisticsDashboardProfile } from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";
import { WorkingSchedulePicker } from "../farmer-profile/WorkingSchedulePicker";

export function WorkingScheduleCard({
  profile,
  isEditing,
  errors,
  onChange,
}: {
  profile: LogisticsDashboardProfile;
  isEditing: boolean;
  errors: Record<string, string>;
  onChange: (updates: Partial<LogisticsDashboardProfile>) => void;
}) {
  const { t } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={CalendarClock} title={t("logisticsProfile.sections.workingSchedule")} />
      <ProfileCardBody>
        <WorkingSchedulePicker
          workingDays={profile.workingDays}
          openingTime={profile.openingTime}
          closingTime={profile.closingTime}
          isEditing={isEditing}
          errors={{
            workingDays: errors.workingDays,
            closingTime: errors.closingTime,
          }}
          onChange={onChange}
        />
      </ProfileCardBody>
    </ProfileCard>
  );
}
