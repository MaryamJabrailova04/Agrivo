import { Building2 } from "lucide-react";
import type { LogisticsDashboardProfile } from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  getLocalizedAddress,
  getLocalizedDescription,
  translateValidationError,
} from "../../../../i18n/logisticsProfileHelpers";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";
import {
  ProfileInfoField,
  ProfileInfoGrid,
  profileInfoInputClassName,
} from "./ProfileInfoField";

export function CompanyInfoCard({
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
  const { t, language } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={Building2} title={t("logisticsProfile.sections.companyInformation")} />
      <ProfileCardBody className="agrivo-profile-info-card-body">
        <ProfileInfoGrid>
          <ProfileInfoField
            label={t("logisticsProfile.fields.companyName")}
            emphasized
            isEditing={isEditing}
            error={errors.companyName ? translateValidationError(t, errors.companyName) : undefined}
            edit={
              <Input
                id="company-name"
                value={profile.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.companyName || t("logisticsProfile.placeholders.companyName")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.contactPerson")}
            emphasized
            isEditing={isEditing}
            error={
              errors.contactPerson ? translateValidationError(t, errors.contactPerson) : undefined
            }
            edit={
              <Input
                id="contact-person"
                value={profile.contactPerson}
                onChange={(e) => onChange({ contactPerson: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.contactPerson || t("logisticsProfile.placeholders.contactPerson")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.registrationNumber")}
            isEditing={isEditing}
            edit={
              <Input
                id="registration-number"
                value={profile.registrationNumber}
                onChange={(e) => onChange({ registrationNumber: e.target.value })}
                placeholder={t("logisticsProfile.placeholders.optional")}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.registrationNumber || t("logisticsProfile.placeholders.notAdded")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.headquartersAddress")}
            isEditing={isEditing}
            edit={
              <Input
                id="headquarters"
                value={profile.address}
                onChange={(e) => onChange({ address: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {getLocalizedAddress(profile, language, t)}
          </ProfileInfoField>
        </ProfileInfoGrid>

        <ProfileInfoField
          label={t("logisticsProfile.fields.companyDescription")}
          multiline
          fullWidth
          isEditing={isEditing}
          edit={
            <Textarea
              id="company-description"
              value={profile.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={4}
              className="rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]"
            />
          }
        >
          {getLocalizedDescription(profile, language) ||
            t("logisticsProfile.placeholders.companyDescription")}
        </ProfileInfoField>
      </ProfileCardBody>
    </ProfileCard>
  );
}
