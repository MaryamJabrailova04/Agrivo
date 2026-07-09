import { MapPinned } from "lucide-react";
import {
  LOGISTICS_ROUTE_SUGGESTIONS,
  LOGISTICS_SERVICE_REGIONS,
  toggleArrayItem,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLocalizedDeliveryRadius,
  translateRouteLabel,
  translateServiceRegion,
} from "../../../../i18n/logisticsProfileHelpers";
import { Input } from "../../ui/input";
import { ChipToggle } from "../farmer-profile/ChipToggle";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";
import {
  ProfileInfoField,
  ProfileInfoGrid,
  ProfileInfoGroup,
  profileInfoInputClassName,
} from "./ProfileInfoField";

export function ServiceCoverageCard({
  profile,
  isEditing,
  onChange,
}: {
  profile: LogisticsDashboardProfile;
  isEditing: boolean;
  onChange: (updates: Partial<LogisticsDashboardProfile>) => void;
}) {
  const { t } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={MapPinned} title={t("logisticsProfile.sections.serviceCoverage")} />
      <ProfileCardBody className="agrivo-profile-info-card-body">
        <ProfileInfoGroup label={t("logisticsProfile.fields.serviceRegions")}>
          {isEditing ? (
            <div className="agrivo-profile-chip-group">
              {LOGISTICS_SERVICE_REGIONS.map((region) => (
                <ChipToggle
                  key={region}
                  label={translateServiceRegion(t, region)}
                  selected={profile.serviceRegions.includes(region)}
                  onClick={() =>
                    onChange({
                      serviceRegions: toggleArrayItem(profile.serviceRegions, region),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group">
              {profile.serviceRegions.length > 0 ? (
                profile.serviceRegions.map((region) => (
                  <span key={region} className="agrivo-logistics-preview-chip">
                    {translateServiceRegion(t, region)}
                  </span>
                ))
              ) : (
                <span className="agrivo-profile-info-field__value--placeholder">
                  {t("logisticsProfile.placeholders.serviceRegions")}
                </span>
              )}
            </div>
          )}
        </ProfileInfoGroup>

        <ProfileInfoGroup label={t("logisticsProfile.fields.mainDeliveryRoutes")}>
          {isEditing ? (
            <div className="agrivo-profile-chip-group">
              {LOGISTICS_ROUTE_SUGGESTIONS.map((route) => (
                <ChipToggle
                  key={route}
                  label={translateRouteLabel(t, route)}
                  selected={profile.mainRoutes.includes(route)}
                  onClick={() =>
                    onChange({
                      mainRoutes: toggleArrayItem(profile.mainRoutes, route),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <ul className="agrivo-logistics-routes-list">
              {profile.mainRoutes.length > 0 ? (
                profile.mainRoutes.map((route) => (
                  <li key={route} className="agrivo-logistics-route-item">
                    <MapPinned className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                    <span className="agrivo-profile-info-field__value">
                      {translateRouteLabel(t, route)}
                    </span>
                  </li>
                ))
              ) : (
                <li className="agrivo-profile-info-field__value--placeholder">
                  {t("logisticsProfile.placeholders.mainRoutes")}
                </li>
              )}
            </ul>
          )}
        </ProfileInfoGroup>

        <ProfileInfoGrid>
          <ProfileInfoField
            label={t("logisticsProfile.fields.deliveryRadius")}
            isEditing={isEditing}
            edit={
              <Input
                id="delivery-radius"
                value={profile.deliveryRadius}
                onChange={(e) => onChange({ deliveryRadius: e.target.value })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.deliveryRadius
              ? formatLocalizedDeliveryRadius(t, profile.deliveryRadius)
              : t("logisticsProfile.placeholders.coverageArea")}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.operatingHours")}
            isEditing={isEditing}
            edit={
              <Input
                id="operating-hours"
                value={profile.operatingHours}
                onChange={(e) => onChange({ operatingHours: e.target.value })}
                placeholder={t("logisticsProfile.placeholders.operatingHoursExample")}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.operatingHours || t("logisticsProfile.placeholders.operatingHours")}
          </ProfileInfoField>
        </ProfileInfoGrid>
      </ProfileCardBody>
    </ProfileCard>
  );
}
