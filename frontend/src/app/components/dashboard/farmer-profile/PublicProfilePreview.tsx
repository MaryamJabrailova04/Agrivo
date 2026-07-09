import { Clock3, Eye, MapPin, MessageCircle, Star } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLocalizedPublicLocation,
  formatLocalizedPublicSchedule,
  formatLocalizedRating,
  getLocalizedProduct,
  translateProfileDescription,
} from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  getProfileInitials,
  type FarmerDashboardProfile,
} from "../../../utils/farmerProfileStorage";
import { Button } from "../../ui/button";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";

export function PublicProfilePreview({ profile }: { profile: FarmerDashboardProfile }) {
  const { t, language } = useLanguage();
  const initials = getProfileInitials(profile.farmName || profile.ownerName);
  const description = profile.description.trim()
    ? translateProfileDescription(t, profile.description)
    : t("farmerDashboardProfile.placeholders.descriptionPreview");
  const schedule = formatLocalizedPublicSchedule(
    t,
    language,
    profile.workingDays,
    profile.openingTime,
    profile.closingTime,
  );

  return (
    <ProfileCard variant="preview">
      <ProfileCardHeader icon={Eye} title={t("farmerDashboardProfile.sections.publicProfilePreview")} />
      <ProfileCardBody className="agrivo-farmer-dash-preview-body">
        <div className="agrivo-farmer-dash-preview-header">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.farmName}
              className="agrivo-farmer-dash-preview-avatar"
            />
          ) : (
            <div className="agrivo-farmer-dash-preview-avatar agrivo-farmer-dash-preview-avatar--fallback">
              {initials || "F"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="agrivo-heading truncate text-base font-bold text-[#102018] sm:text-lg">
              {profile.farmName || t("farmerDashboardProfile.placeholders.farmNamePreview")}
            </h4>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#5F6F64] sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
              {formatLocalizedPublicLocation(t, language, profile)}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#14532D] sm:text-sm">
              <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
              {formatLocalizedRating(t, profile.rating)}
            </p>
          </div>
        </div>

        <p className="agrivo-farmer-dash-preview-description">{description}</p>

        <div className="agrivo-profile-chip-group agrivo-farmer-dash-preview-products">
          {profile.mainProducts.length > 0 ? (
            profile.mainProducts.map((product) => (
              <span key={product} className="agrivo-farmer-dash-preview-chip">
                {getLocalizedProduct(product, language, t)}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#6b7a70] sm:text-sm">
              {t("farmerDashboardProfile.placeholders.mainProducts")}
            </span>
          )}
        </div>

        {schedule ? (
          <div className="agrivo-farmer-dash-preview-schedule">
            <p className="agrivo-farmer-dash-preview-schedule-label">
              <Clock3 className="h-3.5 w-3.5 text-[#43A047]" />
              {t("farmerDashboardProfile.workingHours")}
            </p>
            <p className="text-sm font-semibold text-[#102018]">{schedule.daysLine}</p>
            {schedule.hoursLine ? (
              <p className="text-xs text-[#5F6F64] sm:text-sm">{schedule.hoursLine}</p>
            ) : null}
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="agrivo-farmer-dash-preview-contact h-9 w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          disabled
        >
          <MessageCircle className="mr-2 h-3.5 w-3.5" />
          {t("farmerDashboardProfile.actions.contactFarmer")}
        </Button>
      </ProfileCardBody>
    </ProfileCard>
  );
}
