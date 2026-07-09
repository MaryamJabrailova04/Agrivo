import { Leaf } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  getLocalizedDistrict,
  getLocalizedRegion,
  translateProfileDescription,
} from "../../../../i18n/farmerDashboardProfileHelpers";
import { economicRegions } from "../../../data/azerbaijanRegions";
import {
  getDistrictOptions,
  type FarmerDashboardProfile,
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
import { Textarea } from "../../ui/textarea";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";

const inputClass =
  "mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]";

interface FarmInfoFormProps {
  profile: FarmerDashboardProfile;
  isEditing: boolean;
  errors: Record<string, string>;
  onChange: (updates: Partial<FarmerDashboardProfile>) => void;
}

export function FarmInfoForm({ profile, isEditing, errors, onChange }: FarmInfoFormProps) {
  const { t, language } = useLanguage();
  const districts = getDistrictOptions(profile.region);

  return (
    <ProfileCard>
      <ProfileCardHeader icon={Leaf} title={t("farmerDashboardProfile.sections.farmInformation")} />
      <ProfileCardBody>
        <div className="agrivo-profile-form-grid">
          <div>
            <Label htmlFor="farm-name">{t("farmerDashboardProfile.fields.farmName")}</Label>
            {isEditing ? (
              <>
                <Input
                  id="farm-name"
                  value={profile.farmName}
                  onChange={(event) => onChange({ farmName: event.target.value })}
                  placeholder="Hasanov Green Farm"
                  className={inputClass}
                />
                {errors.farmName ? <p className="agrivo-profile-field-error">{errors.farmName}</p> : null}
              </>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.farmName || t("farmerDashboardProfile.placeholders.farmName")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="owner-name">{t("farmerDashboardProfile.fields.ownerName")}</Label>
            {isEditing ? (
              <>
                <Input
                  id="owner-name"
                  value={profile.ownerName}
                  onChange={(event) => onChange({ ownerName: event.target.value })}
                  placeholder="Demo Farmer"
                  className={inputClass}
                />
                {errors.ownerName ? (
                  <p className="agrivo-profile-field-error">{errors.ownerName}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.ownerName || t("farmerDashboardProfile.placeholders.ownerName")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="region">{t("farmerDashboardProfile.fields.region")}</Label>
            {isEditing ? (
              <Select
                value={profile.region || undefined}
                onValueChange={(value) => onChange({ region: value, district: "" })}
              >
                <SelectTrigger id="region" className={inputClass}>
                  <SelectValue placeholder={t("farmerDashboardProfile.placeholders.region")} />
                </SelectTrigger>
                <SelectContent>
                  {economicRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {getLocalizedRegion(region, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.region
                  ? getLocalizedRegion(profile.region, language)
                  : t("farmerDashboardProfile.placeholders.region")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="district">{t("farmerDashboardProfile.fields.district")}</Label>
            {isEditing ? (
              <Select
                value={profile.district || undefined}
                onValueChange={(value) => onChange({ district: value })}
                disabled={!profile.region}
              >
                <SelectTrigger id="district" className={inputClass}>
                  <SelectValue
                    placeholder={
                      profile.region
                        ? t("farmerDashboardProfile.placeholders.district")
                        : t("farmerDashboardProfile.placeholders.selectRegionFirst")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {getLocalizedDistrict(district, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.district
                  ? getLocalizedDistrict(profile.district, language)
                  : t("farmerDashboardProfile.placeholders.district")}
              </p>
            )}
          </div>

          <div className="agrivo-profile-form-field-full">
            <Label htmlFor="address">{t("farmerDashboardProfile.fields.villageAddress")}</Label>
            {isEditing ? (
              <Input
                id="address"
                value={profile.address}
                onChange={(event) => onChange({ address: event.target.value })}
                placeholder="Seyidəkəran village"
                className={inputClass}
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.address || t("farmerDashboardProfile.placeholders.villageAddress")}
              </p>
            )}
          </div>

          <div className="agrivo-profile-form-field-full">
            <Label htmlFor="description">{t("farmerDashboardProfile.fields.farmDescription")}</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={profile.description}
                onChange={(event) => onChange({ description: event.target.value })}
                placeholder={t("farmerDashboardProfile.descriptions.defaultDemo")}
                className="mt-1.5 min-h-[120px] rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]"
              />
            ) : (
              <p className="mt-1.5 text-sm leading-6 text-[#5F6F64]">
                {profile.description
                  ? translateProfileDescription(t, profile.description)
                  : t("farmerDashboardProfile.placeholders.farmDescription")}
              </p>
            )}
          </div>
        </div>
      </ProfileCardBody>
    </ProfileCard>
  );
}
