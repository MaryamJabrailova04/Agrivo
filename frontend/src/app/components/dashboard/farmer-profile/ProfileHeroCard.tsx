import { BadgeCheck, Camera, MapPin, Pencil, Star } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatLocalizedLocation,
  formatLocalizedMemberSince,
  formatLocalizedOwnerLine,
  formatLocalizedRating,
} from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  formatMemberSince,
  getProfileInitials,
  type FarmerDashboardProfile,
} from "../../../utils/farmerProfileStorage";
import { Button } from "../../ui/button";

interface ProfileHeroCardProps {
  profile: FarmerDashboardProfile;
  isEditing: boolean;
  onEditProfile: () => void;
  onChangePhoto: () => void;
}

export function ProfileHeroCard({
  profile,
  isEditing,
  onEditProfile,
  onChangePhoto,
}: ProfileHeroCardProps) {
  const { t, language } = useLanguage();
  const initials = getProfileInitials(profile.farmName || profile.ownerName);

  return (
    <section className="agrivo-farmer-dash-profile-hero agrivo-dashboard-panel">
      <div className="agrivo-farmer-dash-profile-hero-main">
        <div className="agrivo-farmer-dash-profile-avatar-wrap">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.farmName}
              className="agrivo-farmer-dash-profile-avatar-image"
            />
          ) : (
            <div className="agrivo-farmer-dash-profile-avatar">{initials || "F"}</div>
          )}
          <button
            type="button"
            className="agrivo-farmer-dash-profile-avatar-btn"
            onClick={onChangePhoto}
            aria-label={t("farmerDashboardProfile.changeLogoAria")}
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
              {profile.farmName || t("farmerDashboardProfile.placeholders.farmName")}
            </h2>
            {profile.verified ? (
              <span className="agrivo-farmer-dash-verified-badge">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("farmerDashboardProfile.verifiedFarmer")}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm font-medium text-[#5F6F64]">
            {formatLocalizedOwnerLine(t, profile.ownerName)}
          </p>

          <p className="agrivo-farmer-dash-profile-meta mt-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
            <span>{formatLocalizedLocation(t, language, profile)}</span>
          </p>

          <div className="agrivo-farmer-dash-profile-badges mt-3">
            <span className="agrivo-farmer-dash-profile-badge">
              <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
              {formatLocalizedRating(t, profile.rating)}
            </span>
            <span className="agrivo-farmer-dash-profile-badge">
              {formatLocalizedMemberSince(t, formatMemberSince(profile.memberSince))}
            </span>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="agrivo-farmer-dash-profile-hero-actions">
          <Button
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={onEditProfile}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("farmerDashboardProfile.editProfile")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={onChangePhoto}
          >
            <Camera className="mr-2 h-4 w-4" />
            {t("farmerDashboardProfile.changeLogo")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
