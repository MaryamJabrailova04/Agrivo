import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateCompletionItem } from "../../../../i18n/farmerDashboardProfileHelpers";
import {
  computeProfileCompletion,
  type FarmerDashboardProfile,
} from "../../../utils/farmerProfileStorage";
import { ProfileCard, ProfileCardBody, ProfileCardHeader } from "./ProfileLayout";
import { ProfileCompletionBar } from "./ProfileCompletionBar";

export function TrustVerificationCard({ profile }: { profile: FarmerDashboardProfile }) {
  const { t } = useLanguage();
  const completion = computeProfileCompletion(profile);
  const hasLocation = Boolean(profile.region && profile.district && profile.address.trim());
  const hasProducts = profile.mainProducts.length > 0;

  const checklist = [
    { key: "identityVerified", done: profile.identityVerified },
    { key: "phoneVerified", done: profile.phoneVerified },
    { key: "farmLocationAdded", done: hasLocation },
    { key: "productsListed", done: hasProducts },
  ] as const;

  return (
    <ProfileCard>
      <div className="agrivo-farmer-dash-trust-header">
        <ProfileCardHeader icon={BadgeCheck} title={t("farmerDashboardProfile.sections.trustVerification")} />
        <ProfileCompletionBar percent={completion.percent} className="agrivo-farmer-dash-trust-progress" />
      </div>

      <ProfileCardBody>
        <ul className="agrivo-farmer-dash-trust-list">
          {checklist.map((item) => (
            <li
              key={item.key}
              className={
                item.done ? "agrivo-farmer-dash-trust-item--done" : "agrivo-farmer-dash-trust-item"
              }
            >
              <span className="agrivo-farmer-dash-trust-icon">
                {item.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                ) : (
                  <span className="agrivo-farmer-dash-trust-icon-pending" />
                )}
              </span>
              <span>{t(`farmerDashboardProfile.verification.${item.key}`)}</span>
            </li>
          ))}
        </ul>

        {completion.missingItems.length > 0 ? (
          <p className="agrivo-farmer-dash-trust-hint">
            {t("farmerDashboardProfile.verification.completePrefix")}{" "}
            {completion.missingItems.map((item) => translateCompletionItem(t, item)).join(", ")}.
          </p>
        ) : null}
      </ProfileCardBody>
    </ProfileCard>
  );
}
