import { BadgeCheck, Camera, Pencil, Star } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import {
  formatMemberSince,
  getProfileInitials,
  type LogisticsDashboardProfile,
} from "../../../utils/logisticsProfileStorage";
import { Button } from "../../ui/button";

export function LogisticsProfileHero({
  profile,
  isEditing,
  onEditProfile,
  onChangePhoto,
}: {
  profile: LogisticsDashboardProfile;
  isEditing: boolean;
  onEditProfile: () => void;
  onChangePhoto: () => void;
}) {
  const { t } = useLanguage();
  const initials = getProfileInitials(profile.companyName || profile.contactPerson);

  return (
    <section className="agrivo-logistics-profile-hero agrivo-dashboard-panel">
      <div className="agrivo-logistics-profile-hero-main">
        <div className="agrivo-logistics-profile-avatar-wrap">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.companyName}
              className="agrivo-logistics-profile-avatar-image"
            />
          ) : (
            <div className="agrivo-logistics-profile-avatar">{initials || "L"}</div>
          )}
          <button
            type="button"
            className="agrivo-logistics-profile-avatar-btn"
            onClick={onChangePhoto}
            aria-label={t("logisticsProfile.changeLogoAria")}
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="agrivo-heading text-xl font-bold text-[#102018] sm:text-2xl">
              {profile.companyName || t("logisticsProfile.placeholders.companyName")}
            </h3>
            {profile.verified ? (
              <span className="agrivo-logistics-verified-badge">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("logisticsProfile.verifiedPartner")}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[#5F6F64]">
            {t("logisticsProfile.contactLine", {
              name: profile.contactPerson || t("logisticsProfile.placeholders.contactPerson"),
            })}
          </p>

          <p className="agrivo-logistics-profile-meta mt-2">
            <span>{profile.location || t("logisticsProfile.placeholders.location")}</span>
          </p>

          <div className="agrivo-logistics-profile-badges mt-3">
            <span className="agrivo-logistics-profile-badge">
              <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
              {t("logisticsProfile.ratingValue", { rating: profile.rating.toFixed(1) })}
            </span>
            <span className="agrivo-logistics-profile-badge">
              {t("logisticsProfile.memberSince", {
                year: formatMemberSince(profile.memberSince),
              })}
            </span>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="agrivo-logistics-profile-hero-actions">
          <Button
            type="button"
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={onEditProfile}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("logisticsProfile.editProfile")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
