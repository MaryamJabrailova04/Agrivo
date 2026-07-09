import { useLanguage } from "../../../../i18n/LanguageContext";
import { Button } from "../../ui/button";
import { ProfileCard } from "./ProfileLayout";

interface ProfileActionsBarProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileActionsBar({ isSaving, onCancel, onSave }: ProfileActionsBarProps) {
  const { t } = useLanguage();

  return (
    <ProfileCard variant="actions" className="agrivo-profile-actions-bar">
      <div className="agrivo-profile-form-actions">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t("farmerDashboardProfile.actions.cancel")}
        </Button>
        <Button
          type="button"
          className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t("farmerDashboardProfile.actions.saving") : t("farmerDashboardProfile.actions.saveChanges")}
        </Button>
      </div>
    </ProfileCard>
  );
}
