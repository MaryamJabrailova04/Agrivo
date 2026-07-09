import { Mail, Phone } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { getLocalizedContactMethod } from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  FARMER_PREFERRED_CONTACT_OPTIONS,
  type FarmerDashboardProfile,
  type FarmerPreferredContact,
} from "../../../utils/farmerProfileStorage";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";

const inputClass =
  "mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

interface ContactInfoFormProps {
  profile: FarmerDashboardProfile;
  isEditing: boolean;
  errors: Record<string, string>;
  onChange: (updates: Partial<FarmerDashboardProfile>) => void;
}

export function ContactInfoForm({ profile, isEditing, errors, onChange }: ContactInfoFormProps) {
  const { t } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={Phone} title={t("farmerDashboardProfile.sections.contactInformation")} />
      <ProfileCardBody>
        <div className="agrivo-profile-form-grid">
          <div>
            <Label htmlFor="phone">{t("farmerDashboardProfile.fields.phoneNumber")}</Label>
            {isEditing ? (
              <>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(event) => onChange({ phone: event.target.value })}
                  placeholder="+994 50 123 45 67"
                  className={inputClass}
                />
                {errors.phone ? <p className="agrivo-profile-field-error">{errors.phone}</p> : null}
              </>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.phone || t("farmerDashboardProfile.placeholders.phone")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">{t("farmerDashboardProfile.fields.emailAddress")}</Label>
            {isEditing ? (
              <>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(event) => onChange({ email: event.target.value })}
                  placeholder="farmer@agrivo.az"
                  className={inputClass}
                />
                {errors.email ? <p className="agrivo-profile-field-error">{errors.email}</p> : null}
              </>
            ) : (
              <p className="mt-1.5 flex items-center gap-2 text-sm font-medium text-[#102018]">
                <Mail className="h-3.5 w-3.5 text-[#43A047]" />
                {profile.email || t("farmerDashboardProfile.placeholders.email")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="whatsapp">{t("farmerDashboardProfile.fields.whatsappNumber")}</Label>
            {isEditing ? (
              <Input
                id="whatsapp"
                value={profile.whatsapp}
                onChange={(event) => onChange({ whatsapp: event.target.value })}
                placeholder="+994 50 123 45 67"
                className={inputClass}
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.whatsapp || t("farmerDashboardProfile.placeholders.whatsapp")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="preferred-contact">
              {t("farmerDashboardProfile.fields.preferredContactMethod")}
            </Label>
            {isEditing ? (
              <Select
                value={profile.preferredContact}
                onValueChange={(value) =>
                  onChange({ preferredContact: value as FarmerPreferredContact })
                }
              >
                <SelectTrigger id="preferred-contact" className={inputClass}>
                  <SelectValue placeholder={t("farmerDashboardProfile.placeholders.contactMethod")} />
                </SelectTrigger>
                <SelectContent>
                  {FARMER_PREFERRED_CONTACT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {getLocalizedContactMethod(option, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {getLocalizedContactMethod(profile.preferredContact, t)}
              </p>
            )}
          </div>
        </div>
      </ProfileCardBody>
    </ProfileCard>
  );
}
