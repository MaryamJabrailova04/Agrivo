import { Phone } from "lucide-react";
import {
  LOGISTICS_PREFERRED_CONTACT_OPTIONS,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  translatePreferredContact,
  translateValidationError,
} from "../../../../i18n/logisticsProfileHelpers";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";
import {
  ProfileInfoField,
  ProfileInfoGrid,
  profileInfoInputClassName,
} from "./ProfileInfoField";

export function ContactInfoCard({
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
      <ProfileCardHeader icon={Phone} title={t("logisticsProfile.sections.contactInformation")} />
      <ProfileCardBody className="agrivo-profile-info-card-body">
        <ProfileInfoGrid>
          <ProfileInfoField
            label={t("logisticsProfile.fields.phoneNumber")}
            emphasized
            isEditing={isEditing}
            error={errors.phone ? translateValidationError(t, errors.phone) : undefined}
            edit={
              <Input
                id="logistics-phone"
                value={profile.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.phone || t("logisticsProfile.placeholders.phoneNumber")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.emailAddress")}
            isEditing={isEditing}
            error={errors.email ? translateValidationError(t, errors.email) : undefined}
            edit={
              <Input
                id="logistics-email"
                type="email"
                value={profile.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.email || t("logisticsProfile.placeholders.emailAddress")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.whatsappNumber")}
            isEditing={isEditing}
            edit={
              <Input
                id="logistics-whatsapp"
                value={profile.whatsapp}
                onChange={(e) => onChange({ whatsapp: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.whatsapp || t("logisticsProfile.placeholders.whatsappNumber")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.emergencyContactNumber")}
            isEditing={isEditing}
            edit={
              <Input
                id="logistics-emergency"
                value={profile.emergencyContact}
                onChange={(e) => onChange({ emergencyContact: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.emergencyContact || t("logisticsProfile.placeholders.emergencyContact")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.preferredContactMethod")}
            fullWidth
            isEditing={isEditing}
            edit={
              <Select
                value={profile.preferredContactMethod}
                onValueChange={(value) =>
                  onChange({
                    preferredContactMethod: value as LogisticsDashboardProfile["preferredContactMethod"],
                  })
                }
              >
                <SelectTrigger className={profileInfoInputClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOGISTICS_PREFERRED_CONTACT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {translatePreferredContact(t, option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            {translatePreferredContact(t, profile.preferredContactMethod)}
          </ProfileInfoField>
        </ProfileInfoGrid>
      </ProfileCardBody>
    </ProfileCard>
  );
}
