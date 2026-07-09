import { Truck } from "lucide-react";
import {
  LOGISTICS_DELIVERY_TYPES,
  LOGISTICS_VEHICLE_TYPES,
  toggleArrayItem,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLocalizedCapacity,
  translateDeliveryType,
  translateVehicleType,
  translateYesNo,
} from "../../../../i18n/logisticsProfileHelpers";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { ChipToggle } from "../farmer-profile/ChipToggle";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";
import {
  ProfileInfoField,
  ProfileInfoGrid,
  ProfileInfoGroup,
  profileInfoInputClassName,
} from "./ProfileInfoField";

export function OperationsCapacityCard({
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
      <ProfileCardHeader icon={Truck} title={t("logisticsProfile.sections.operationsCapacity")} />
      <ProfileCardBody className="agrivo-profile-info-card-body">
        <ProfileInfoGrid>
          <ProfileInfoField
            label={t("logisticsProfile.fields.numberOfDrivers")}
            emphasized
            isEditing={isEditing}
            edit={
              <Input
                id="drivers-count"
                type="number"
                min={0}
                value={profile.driversCount}
                onChange={(e) => onChange({ driversCount: Number(e.target.value) || 0 })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.driversCount}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.numberOfVehicles")}
            emphasized
            isEditing={isEditing}
            edit={
              <Input
                id="vehicles-count"
                type="number"
                min={0}
                value={profile.vehiclesCount}
                onChange={(e) => onChange({ vehiclesCount: Number(e.target.value) || 0 })}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.vehiclesCount}
          </ProfileInfoField>

          <ProfileInfoField
            label={t("logisticsProfile.fields.maxDailyCapacity")}
            emphasized
            fullWidth
            isEditing={isEditing}
            edit={
              <Input
                value={profile.maxDailyCapacity}
                onChange={(e) => onChange({ maxDailyCapacity: e.target.value })}
                placeholder={t("logisticsProfile.placeholders.capacityExample")}
                className={profileInfoInputClassName}
              />
            }
          >
            {profile.maxDailyCapacity
              ? formatLocalizedCapacity(t, profile.maxDailyCapacity)
              : t("logisticsProfile.placeholders.deliveryCapacity")}
          </ProfileInfoField>
        </ProfileInfoGrid>

        <ProfileInfoGroup label={t("logisticsProfile.fields.vehicleTypes")}>
          {isEditing ? (
            <div className="agrivo-profile-chip-group">
              {LOGISTICS_VEHICLE_TYPES.map((type) => (
                <ChipToggle
                  key={type}
                  label={translateVehicleType(t, type)}
                  selected={profile.vehicleTypes.includes(type)}
                  onClick={() =>
                    onChange({
                      vehicleTypes: toggleArrayItem(profile.vehicleTypes, type),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group">
              {profile.vehicleTypes.length > 0 ? (
                profile.vehicleTypes.map((type) => (
                  <span key={type} className="agrivo-logistics-preview-chip">
                    {translateVehicleType(t, type)}
                  </span>
                ))
              ) : (
                <span className="agrivo-profile-info-field__value--placeholder">
                  {t("logisticsProfile.placeholders.vehicleTypes")}
                </span>
              )}
            </div>
          )}
        </ProfileInfoGroup>

        <ProfileInfoGroup label={t("logisticsProfile.fields.supportedDeliveryTypes")}>
          {isEditing ? (
            <div className="agrivo-profile-chip-group">
              {LOGISTICS_DELIVERY_TYPES.map((type) => (
                <ChipToggle
                  key={type}
                  label={translateDeliveryType(t, type)}
                  selected={profile.supportedDeliveryTypes.includes(type)}
                  onClick={() =>
                    onChange({
                      supportedDeliveryTypes: toggleArrayItem(
                        profile.supportedDeliveryTypes,
                        type,
                      ),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group">
              {profile.supportedDeliveryTypes.length > 0 ? (
                profile.supportedDeliveryTypes.map((type) => (
                  <span key={type} className="agrivo-logistics-preview-chip">
                    {translateDeliveryType(t, type)}
                  </span>
                ))
              ) : (
                <span className="agrivo-profile-info-field__value--placeholder">
                  {t("logisticsProfile.placeholders.deliveryTypes")}
                </span>
              )}
            </div>
          )}
        </ProfileInfoGroup>

        <div className="agrivo-logistics-toggle-grid">
          <div className="agrivo-logistics-toggle-row">
            <div className="agrivo-profile-info-field">
              <span className="agrivo-profile-info-field__label">
                {t("logisticsProfile.fields.coldChainSupport")}
              </span>
              <span className="agrivo-profile-info-field__hint">
                {t("logisticsProfile.hints.refrigeratedTransport")}
              </span>
            </div>
            {isEditing ? (
              <Switch
                checked={profile.coldChainSupport}
                onCheckedChange={(checked) => onChange({ coldChainSupport: checked })}
              />
            ) : (
              <span className="agrivo-profile-info-field__value agrivo-profile-info-field__value--emphasized">
                {translateYesNo(t, profile.coldChainSupport)}
              </span>
            )}
          </div>

          <div className="agrivo-logistics-toggle-row">
            <div className="agrivo-profile-info-field">
              <span className="agrivo-profile-info-field__label">
                {t("logisticsProfile.fields.sameDayDelivery")}
              </span>
              <span className="agrivo-profile-info-field__hint">
                {t("logisticsProfile.hints.expressSameDay")}
              </span>
            </div>
            {isEditing ? (
              <Switch
                checked={profile.sameDayDelivery}
                onCheckedChange={(checked) => onChange({ sameDayDelivery: checked })}
              />
            ) : (
              <span className="agrivo-profile-info-field__value agrivo-profile-info-field__value--emphasized">
                {translateYesNo(t, profile.sameDayDelivery)}
              </span>
            )}
          </div>
        </div>
      </ProfileCardBody>
    </ProfileCard>
  );
}
