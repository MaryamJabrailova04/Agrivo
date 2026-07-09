import { Briefcase } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  getLocalizedCategory,
  getLocalizedDeliveryOption,
  getLocalizedPaymentMethod,
  getLocalizedProduct,
  translateLocalizedFarmSize,
} from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  FARMER_PROFILE_CATEGORIES,
  FARMER_PROFILE_DELIVERY_OPTIONS,
  FARMER_PROFILE_PAYMENT_METHODS,
  FARMER_PROFILE_PRODUCT_SUGGESTIONS,
  toggleArrayItem,
  type FarmerDashboardProfile,
} from "../../../utils/farmerProfileStorage";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ChipToggle } from "./ChipToggle";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";

interface BusinessDetailsCardProps {
  profile: FarmerDashboardProfile;
  isEditing: boolean;
  onChange: (updates: Partial<FarmerDashboardProfile>) => void;
}

export function BusinessDetailsCard({ profile, isEditing, onChange }: BusinessDetailsCardProps) {
  const { t, language } = useLanguage();

  return (
    <ProfileCard>
      <ProfileCardHeader icon={Briefcase} title={t("farmerDashboardProfile.sections.businessDetails")} />
      <ProfileCardBody className="agrivo-profile-card-body--stacked">
        <div>
          <Label>{t("farmerDashboardProfile.fields.mainProductCategories")}</Label>
          {isEditing ? (
            <div className="agrivo-profile-chip-group mt-2">
              {FARMER_PROFILE_CATEGORIES.map((category) => (
                <ChipToggle
                  key={category}
                  label={getLocalizedCategory(category, language, t)}
                  selected={profile.mainCategories.includes(category)}
                  onClick={() =>
                    onChange({
                      mainCategories: toggleArrayItem(profile.mainCategories, category),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group mt-2">
              {profile.mainCategories.length > 0 ? (
                profile.mainCategories.map((category) => (
                  <span key={category} className="agrivo-farmer-dash-preview-chip">
                    {getLocalizedCategory(category, language, t)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7a70]">
                  {t("farmerDashboardProfile.placeholders.mainCategories")}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <Label>{t("farmerDashboardProfile.fields.mainProducts")}</Label>
          {isEditing ? (
            <>
              <div className="agrivo-profile-chip-group mt-2">
                {FARMER_PROFILE_PRODUCT_SUGGESTIONS.map((product) => (
                  <ChipToggle
                    key={product}
                    label={getLocalizedProduct(product, language, t)}
                    selected={profile.mainProducts.includes(product)}
                    onClick={() =>
                      onChange({
                        mainProducts: toggleArrayItem(profile.mainProducts, product),
                      })
                    }
                  />
                ))}
              </div>
              <Input
                value={profile.mainProducts.join(", ")}
                onChange={(event) =>
                  onChange({
                    mainProducts: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={FARMER_PROFILE_PRODUCT_SUGGESTIONS.map((product) =>
                  getLocalizedProduct(product, language, t),
                ).join(", ")}
                className="mt-2 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018]"
              />
            </>
          ) : (
            <div className="agrivo-profile-chip-group mt-2">
              {profile.mainProducts.length > 0 ? (
                profile.mainProducts.map((product) => (
                  <span key={product} className="agrivo-farmer-dash-preview-chip">
                    {getLocalizedProduct(product, language, t)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7a70]">
                  {t("farmerDashboardProfile.placeholders.mainProducts")}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="agrivo-profile-form-grid">
          <div>
            <Label htmlFor="farm-size">{t("farmerDashboardProfile.fields.farmSize")}</Label>
            {isEditing ? (
              <Input
                id="farm-size"
                value={profile.farmSize}
                onChange={(event) => onChange({ farmSize: event.target.value })}
                placeholder="5 hectares"
                className="mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm"
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.farmSize
                  ? translateLocalizedFarmSize(t, profile.farmSize)
                  : t("farmerDashboardProfile.placeholders.farmSize")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="minimum-order">{t("farmerDashboardProfile.fields.minimumOrderQuantity")}</Label>
            {isEditing ? (
              <Input
                id="minimum-order"
                value={profile.minimumOrder}
                onChange={(event) => onChange({ minimumOrder: event.target.value })}
                placeholder="50 kg"
                className="mt-1.5 h-11 rounded-xl border-[#DEECE0] bg-[#F7FBF5] text-sm"
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium text-[#102018]">
                {profile.minimumOrder || t("farmerDashboardProfile.placeholders.minimumOrder")}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>{t("farmerDashboardProfile.fields.deliveryOptions")}</Label>
          {isEditing ? (
            <div className="agrivo-profile-chip-group mt-2">
              {FARMER_PROFILE_DELIVERY_OPTIONS.map((option) => (
                <ChipToggle
                  key={option}
                  label={getLocalizedDeliveryOption(option, t)}
                  selected={profile.deliveryOptions.includes(option)}
                  onClick={() =>
                    onChange({
                      deliveryOptions: toggleArrayItem(profile.deliveryOptions, option),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group mt-2">
              {profile.deliveryOptions.length > 0 ? (
                profile.deliveryOptions.map((option) => (
                  <span key={option} className="agrivo-farmer-dash-preview-chip">
                    {getLocalizedDeliveryOption(option, t)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7a70]">
                  {t("farmerDashboardProfile.placeholders.deliveryOptions")}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <Label>{t("farmerDashboardProfile.fields.paymentMethods")}</Label>
          {isEditing ? (
            <div className="agrivo-profile-chip-group mt-2">
              {FARMER_PROFILE_PAYMENT_METHODS.map((method) => (
                <ChipToggle
                  key={method}
                  label={getLocalizedPaymentMethod(method, t)}
                  selected={profile.paymentMethods.includes(method)}
                  onClick={() =>
                    onChange({
                      paymentMethods: toggleArrayItem(profile.paymentMethods, method),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-profile-chip-group mt-2">
              {profile.paymentMethods.length > 0 ? (
                profile.paymentMethods.map((method) => (
                  <span key={method} className="agrivo-farmer-dash-preview-chip">
                    {getLocalizedPaymentMethod(method, t)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#6b7a70]">
                  {t("farmerDashboardProfile.placeholders.paymentMethods")}
                </p>
              )}
            </div>
          )}
        </div>
      </ProfileCardBody>
    </ProfileCard>
  );
}
