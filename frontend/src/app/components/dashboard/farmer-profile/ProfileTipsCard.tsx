import { CheckCircle2, Lightbulb } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";

const TIP_KEYS = [
  "farmerDashboardProfile.tips.clearDescription",
  "farmerDashboardProfile.tips.keepContactUpdated",
  "farmerDashboardProfile.tips.addMainProducts",
  "farmerDashboardProfile.tips.updateWorkingHours",
] as const;

export function ProfileTipsCard() {
  const { t } = useLanguage();

  return (
    <ProfileCard variant="tips">
      <ProfileCardHeader icon={Lightbulb} title={t("farmerDashboardProfile.sections.profileTips")} />
      <ProfileCardBody>
        <p className="text-sm leading-6 text-[#5F6F64]">{t("farmerDashboardProfile.tips.intro")}</p>
        <ul className="agrivo-profile-tips-list">
          {TIP_KEYS.map((tipKey) => (
            <li key={tipKey}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#43A047]" aria-hidden />
              <span>{t(tipKey)}</span>
            </li>
          ))}
        </ul>
      </ProfileCardBody>
    </ProfileCard>
  );
}
