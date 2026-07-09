import { BadgeCheck, Eye, MapPin, MessageCircle, Star } from "lucide-react";
import {
  getProfileInitials,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLogisticsScheduleSummary,
  getLocalizedDescription,
  translateDeliveryType,
  translateServiceRegion,
} from "../../../../i18n/logisticsProfileHelpers";
import { Button } from "../../ui/button";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "../farmer-profile/ProfileLayout";

export function PublicCompanyPreview({ profile }: { profile: LogisticsDashboardProfile }) {
  const { t, language } = useLanguage();
  const initials = getProfileInitials(profile.companyName || profile.contactPerson);
  const description =
    getLocalizedDescription(profile, language) ||
    t("logisticsProfile.placeholders.publicDescription");
  const schedule = formatLogisticsScheduleSummary(
    t,
    language,
    profile.workingDays,
    profile.openingTime,
    profile.closingTime,
  );

  return (
    <ProfileCard variant="preview">
      <ProfileCardHeader icon={Eye} title={t("logisticsProfile.sections.publicProfilePreview")} />
      <ProfileCardBody className="agrivo-logistics-preview-body agrivo-logistics-preview-body--compact">
        <div className="agrivo-logistics-preview-header agrivo-logistics-preview-header--compact">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.companyName}
              className="agrivo-logistics-preview-avatar agrivo-logistics-preview-avatar--compact"
            />
          ) : (
            <div className="agrivo-logistics-preview-avatar agrivo-logistics-preview-avatar--fallback agrivo-logistics-preview-avatar--compact">
              {initials || "L"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="agrivo-heading truncate text-sm font-bold text-[#102018] sm:text-base">
                {profile.companyName || t("logisticsProfile.placeholders.companyName")}
              </h4>
              {profile.verified ? (
                <span className="agrivo-logistics-preview-verified">
                  <BadgeCheck className="h-3 w-3" />
                  {t("logisticsProfile.documentStatus.verified")}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#5F6F64]">
              <MapPin className="h-3 w-3 shrink-0 text-[#43A047]" />
              {profile.location || t("logisticsProfile.placeholders.location")}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#14532D]">
              <Star className="h-3 w-3 fill-[#facc15] text-[#facc15]" />
              {t("logisticsProfile.ratingValue", { rating: profile.rating.toFixed(1) })}
            </p>
          </div>
        </div>

        <p className="agrivo-logistics-preview-description agrivo-logistics-preview-description--clamp">
          {description}
        </p>

        <div className="agrivo-profile-chip-group agrivo-logistics-preview-chips">
          {profile.supportedDeliveryTypes.length > 0 ? (
            profile.supportedDeliveryTypes.map((type) => (
              <span key={type} className="agrivo-logistics-preview-chip agrivo-logistics-preview-chip--compact">
                {translateDeliveryType(t, type)}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#6b7a70]">
              {t("logisticsProfile.placeholders.deliveryTypes")}
            </span>
          )}
        </div>

        <div className="agrivo-profile-chip-group agrivo-logistics-preview-chips">
          {profile.serviceRegions.length > 0 ? (
            profile.serviceRegions.slice(0, 5).map((region) => (
              <span
                key={region}
                className="agrivo-logistics-preview-chip agrivo-logistics-preview-chip--region agrivo-logistics-preview-chip--compact"
              >
                {translateServiceRegion(t, region)}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#6b7a70]">
              {t("logisticsProfile.placeholders.serviceRegions")}
            </span>
          )}
        </div>

        {schedule ? <p className="agrivo-logistics-preview-schedule">{schedule}</p> : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="agrivo-logistics-preview-contact h-8 w-full rounded-full border-[#dbe7d4] text-xs text-[#14532D] hover:bg-[#EAF7EC]"
          disabled
        >
          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
          {t("logisticsProfile.actions.contactPartner")}
        </Button>
      </ProfileCardBody>
    </ProfileCard>
  );
}
