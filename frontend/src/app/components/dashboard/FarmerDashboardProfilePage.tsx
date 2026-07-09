import { CheckCircle2, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { setAuthUser } from "../../auth/authStorage";
import { isApiMode } from "../../../config/dataMode";
import { getFarmerProfileApi, updateFarmerProfileApi } from "../../../api/profileApi";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateProfileError } from "../../../i18n/farmerDashboardProfileHelpers";
import {
  cloneFarmerProfile,
  computeFarmerProfileStats,
  getFarmerDashboardProfile,
  resolveFarmerProfileUserId,
  setFarmerDashboardProfile,
  validateFarmerProfile,
  type FarmerDashboardProfile,
} from "../../utils/farmerProfileStorage";
import { validateSchedule } from "../../utils/workingSchedule";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { BusinessDetailsCard } from "./farmer-profile/BusinessDetailsCard";
import { ContactInfoForm } from "./farmer-profile/ContactInfoForm";
import { FarmInfoForm } from "./farmer-profile/FarmInfoForm";
import { ProfileActionsBar } from "./farmer-profile/ProfileActionsBar";
import {
  ProfileLeftColumn,
  ProfileMainGrid,
  ProfileRightColumn,
} from "./farmer-profile/ProfileLayout";
import { ProfileTipsCard } from "./farmer-profile/ProfileTipsCard";
import { ProfileHeroCard } from "./farmer-profile/ProfileHeroCard";
import { ProfileStats } from "./farmer-profile/ProfileStats";
import { PublicProfilePreview } from "./farmer-profile/PublicProfilePreview";
import { TrustVerificationCard } from "./farmer-profile/TrustVerificationCard";
import { WorkingScheduleCard } from "./farmer-profile/WorkingScheduleCard";

function mapScheduleErrors(errors: Record<string, string>): Record<string, string> {
  const mapped: Record<string, string> = {};
  if (errors.workingDays) {
    mapped.workingDays = "farmerDashboardProfile.errors.workingDaysRequired";
  }
  if (errors.closingTime) {
    mapped.closingTime = "farmerDashboardProfile.errors.closingTimeInvalid";
  }
  return mapped;
}

export function FarmerDashboardProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolveFarmerProfileUserId(user);

  const [profile, setProfile] = useState<FarmerDashboardProfile | null>(null);
  const [draft, setDraft] = useState<FarmerDashboardProfile | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<FarmerDashboardProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user) {
      setProfile(null);
      setDraft(null);
      return;
    }
    if (isApiMode) {
      getFarmerProfileApi<Record<string, unknown>>()
        .then(() => {
          const loaded = getFarmerDashboardProfile(user);
          setProfile(loaded);
          setDraft(loaded);
        })
        .catch(() => setApiError(t("farmerDashboardProfile.errors.failedLoad")));
    } else {
      const loaded = getFarmerDashboardProfile(user);
      setProfile(loaded);
      setDraft(loaded);
    }
  }, [user, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const displayProfile = isEditing && draft ? draft : profile;

  const stats = useMemo(() => {
    if (!userId || !displayProfile) {
      return { activeProducts: 0, completedOrders: 0, totalRevenue: 0, rating: 0 };
    }
    return computeFarmerProfileStats(userId, displayProfile);
  }, [userId, displayProfile]);

  const enterEditMode = () => {
    if (!profile) return;
    const snapshot = cloneFarmerProfile(profile);
    setSavedSnapshot(snapshot);
    setDraft(snapshot);
    setIsEditing(true);
    setFormErrors({});
  };

  const cancelEdit = () => {
    if (savedSnapshot) {
      setDraft(cloneFarmerProfile(savedSnapshot));
      setProfile(cloneFarmerProfile(savedSnapshot));
    }
    setIsEditing(false);
    setFormErrors({});
    setSavedSnapshot(null);
  };

  const handleDraftChange = (updates: Partial<FarmerDashboardProfile>) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
  };

  const syncAuthUser = (next: FarmerDashboardProfile) => {
    if (!user) return;
    setAuthUser({
      ...user,
      name: next.ownerName,
      email: next.email,
      phone: next.phone,
    });
    window.dispatchEvent(new Event("agrivo-auth-changed"));
  };

  const handleSave = async () => {
    if (!draft || !userId) return;

    const errors = validateFarmerProfile(draft);
    const scheduleErrors = mapScheduleErrors(
      validateSchedule(draft.workingDays, draft.openingTime, draft.closingTime),
    );
    const allErrors = { ...errors, ...scheduleErrors };

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      showToast(t("farmerDashboardProfile.errors.fixHighlighted"));
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));

    if (isApiMode) {
      try {
        await updateFarmerProfileApi({
          farmName: draft.farmName,
          ownerName: draft.ownerName,
          region: draft.region,
          district: draft.district,
          village: draft.village,
          address: draft.address,
          description: draft.description,
          mainProducts: draft.mainProducts.join(", "),
          mainCategories: draft.mainCategories.join(", "),
          farmSize: draft.farmSize,
          minimumOrder: draft.minimumOrder,
          deliveryOptions: draft.deliveryOptions.join(", "),
          paymentMethods: draft.paymentMethods.join(", "),
          workingDays: draft.workingDays.join(", "),
          openingTime: draft.openingTime,
          closingTime: draft.closingTime,
        });
      } catch {
        setApiError(t("farmerDashboardProfile.errors.failedSave"));
      }
    }

    setFarmerDashboardProfile(userId, draft);
    setProfile(cloneFarmerProfile(draft));
    syncAuthUser(draft);
    setIsEditing(false);
    setSavedSnapshot(null);
    setFormErrors({});
    setIsSaving(false);
    showToast(t("farmerDashboardProfile.feedback.updated"));
  };

  if (!userId || !displayProfile) return null;

  const localizedErrors = Object.fromEntries(
    Object.entries(formErrors).map(([key, value]) => [key, translateProfileError(t, value)]),
  );

  return (
    <div className="agrivo-farmer-dash-profile">
      {toast ? (
        <div className="agrivo-cart-toast agrivo-cart-toast--success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      ) : null}
      {apiError ? (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {apiError}
        </div>
      ) : null}

      {isEditing ? (
        <div className="agrivo-profile-editing-banner">{t("farmerDashboardProfile.editingBanner")}</div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("farmerDashboardProfile.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("farmerDashboardProfile.subtitle")}
          </p>
        </div>
        <div className="agrivo-farmer-order-info-card">
          <Info className="h-4 w-4 shrink-0 text-[#15803d]" />
          <p className="text-sm font-medium text-[#14532D]">{t("farmerDashboardProfile.infoBox")}</p>
        </div>
      </div>

      <ProfileHeroCard
        profile={displayProfile}
        isEditing={isEditing}
        onEditProfile={enterEditMode}
        onChangePhoto={() => setPhotoDialogOpen(true)}
      />

      <ProfileStats stats={stats} />

      <ProfileMainGrid>
        <ProfileLeftColumn>
          <FarmInfoForm
            profile={displayProfile}
            isEditing={isEditing}
            errors={localizedErrors}
            onChange={handleDraftChange}
          />
          <ContactInfoForm
            profile={displayProfile}
            isEditing={isEditing}
            errors={localizedErrors}
            onChange={handleDraftChange}
          />
          <WorkingScheduleCard
            profile={displayProfile}
            isEditing={isEditing}
            errors={{
              workingDays: localizedErrors.workingDays,
              closingTime: localizedErrors.closingTime,
            }}
            onChange={handleDraftChange}
          />
          {isEditing ? (
            <ProfileActionsBar isSaving={isSaving} onCancel={cancelEdit} onSave={handleSave} />
          ) : null}
        </ProfileLeftColumn>

        <ProfileRightColumn>
          <BusinessDetailsCard
            profile={displayProfile}
            isEditing={isEditing}
            onChange={handleDraftChange}
          />
          <PublicProfilePreview profile={displayProfile} />
          <TrustVerificationCard profile={displayProfile} />
          <ProfileTipsCard />
        </ProfileRightColumn>
      </ProfileMainGrid>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="agrivo-profile-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {t("farmerDashboardProfile.logoDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F6F64]">
              {t("farmerDashboardProfile.logoDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => setPhotoDialogOpen(false)}
            >
              {t("farmerDashboardProfile.actions.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
