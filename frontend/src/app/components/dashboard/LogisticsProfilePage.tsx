import { CheckCircle2, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { setAuthUser } from "../../auth/authStorage";
import { isApiMode } from "../../../config/dataMode";
import { getLogisticsProfileApi, updateLogisticsProfileApi } from "../../../api/profileApi";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateDocumentUploadLabel } from "../../../i18n/logisticsProfileHelpers";
import {
  cloneLogisticsProfile,
  computeLogisticsProfileStats,
  getLogisticsDashboardProfile,
  resolveLogisticsProfileUserId,
  setLogisticsDashboardProfile,
  validateLogisticsProfile,
  type LogisticsDashboardProfile,
} from "../../utils/logisticsProfileStorage";
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
import { ProfileActionsBar } from "./farmer-profile/ProfileActionsBar";
import { CompanyInfoCard } from "./logistics-profile/CompanyInfoCard";
import { ContactInfoCard } from "./logistics-profile/ContactInfoCard";
import { DocumentsComplianceCard } from "./logistics-profile/DocumentsComplianceCard";
import {
  LogisticsProfileLeftColumn,
  LogisticsProfileMainGrid,
  LogisticsProfileRightColumn,
  LogisticsProfileSection,
} from "./logistics-profile/LogisticsProfileLayout";
import { LogisticsProfileHero } from "./logistics-profile/LogisticsProfileHero";
import { LogisticsProfileStats } from "./logistics-profile/LogisticsProfileStats";
import { OperationsCapacityCard } from "./logistics-profile/OperationsCapacityCard";
import { PublicCompanyPreview } from "./logistics-profile/PublicCompanyPreview";
import { ServiceCoverageCard } from "./logistics-profile/ServiceCoverageCard";
import { TrustVerificationCard } from "./logistics-profile/TrustVerificationCard";
import { WorkingScheduleCard } from "./logistics-profile/WorkingScheduleCard";

export function LogisticsProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = resolveLogisticsProfileUserId(user);

  const [profile, setProfile] = useState<LogisticsDashboardProfile | null>(null);
  const [draft, setDraft] = useState<LogisticsDashboardProfile | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<LogisticsDashboardProfile | null>(null);
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
      getLogisticsProfileApi<Record<string, unknown>>()
        .then(() => {
          const loaded = getLogisticsDashboardProfile(user);
          setProfile(loaded);
          setDraft(loaded);
        })
        .catch(() => setApiError(t("logisticsProfile.feedback.loadFailed")));
    } else {
      const loaded = getLogisticsDashboardProfile(user);
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
    if (!displayProfile) {
      return {
        totalDeliveries: 0,
        activeDrivers: 0,
        fleetSize: 0,
        serviceRegions: 0,
        onTimeRate: 0,
      };
    }
    return computeLogisticsProfileStats(displayProfile);
  }, [displayProfile]);

  const enterEditMode = () => {
    if (!profile) return;
    const snapshot = cloneLogisticsProfile(profile);
    setSavedSnapshot(snapshot);
    setDraft(snapshot);
    setIsEditing(true);
    setFormErrors({});
  };

  const cancelEdit = () => {
    if (savedSnapshot) {
      setDraft(cloneLogisticsProfile(savedSnapshot));
      setProfile(cloneLogisticsProfile(savedSnapshot));
    }
    setIsEditing(false);
    setFormErrors({});
    setSavedSnapshot(null);
  };

  const handleDraftChange = (updates: Partial<LogisticsDashboardProfile>) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
  };

  const syncAuthUser = (next: LogisticsDashboardProfile) => {
    if (!user) return;
    setAuthUser({
      ...user,
      name: next.contactPerson,
      email: next.email,
      phone: next.phone,
    });
    window.dispatchEvent(new Event("agrivo-auth-changed"));
  };

  const handleSave = async () => {
    if (!draft || !userId) return;

    const errors = validateLogisticsProfile(draft);
    const scheduleErrors = validateSchedule(
      draft.workingDays,
      draft.openingTime,
      draft.closingTime,
    );
    const allErrors = { ...errors, ...scheduleErrors };

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      showToast(t("logisticsProfile.feedback.fixHighlightedFields"));
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));

    if (isApiMode) {
      try {
        await updateLogisticsProfileApi({
          companyName: draft.companyName,
          contactPerson: draft.contactPerson,
          registrationNumber: draft.registrationNumber,
          address: draft.address,
          serviceRegions: draft.serviceRegions.join(", "),
          mainRoutes: draft.mainRoutes.join(", "),
          driversCount: draft.driversCount,
          vehiclesCount: draft.vehiclesCount,
          vehicleTypes: draft.vehicleTypes.join(", "),
          maxDailyCapacity: draft.maxDailyCapacity,
          supportedDeliveryTypes: draft.supportedDeliveryTypes.join(", "),
          coldChainSupport: draft.coldChainSupport,
          sameDayDelivery: draft.sameDayDelivery,
          workingDays: draft.workingDays.join(", "),
          openingTime: draft.openingTime,
          closingTime: draft.closingTime,
        });
      } catch {
        setApiError(t("logisticsProfile.feedback.saveFailed"));
      }
    }

    setLogisticsDashboardProfile(userId, draft);
    setProfile(cloneLogisticsProfile(draft));
    syncAuthUser(draft);
    setIsEditing(false);
    setSavedSnapshot(null);
    setFormErrors({});
    setIsSaving(false);
    showToast(t("logisticsProfile.feedback.profileUpdated"));
  };

  if (!userId || !displayProfile) return null;

  return (
    <div className="agrivo-logistics-profile">
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
        <div className="agrivo-profile-editing-banner">
          {t("logisticsProfile.editingBanner")}
        </div>
      ) : null}

      <div className="agrivo-logistics-profile-header">
        <div>
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
            {t("logisticsProfile.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("logisticsProfile.subtitle")}
          </p>
        </div>
        <div className="agrivo-logistics-profile-helper">
          <Info className="h-4 w-4 shrink-0 text-[#15803d]" />
          <p className="text-sm font-medium text-[#14532D]">{t("logisticsProfile.infoBox")}</p>
        </div>
      </div>

      <LogisticsProfileHero
        profile={displayProfile}
        isEditing={isEditing}
        onEditProfile={enterEditMode}
        onChangePhoto={() => setPhotoDialogOpen(true)}
      />

      <LogisticsProfileStats stats={stats} />

      <LogisticsProfileMainGrid>
        <LogisticsProfileLeftColumn>
          <LogisticsProfileSection id="company">
            <CompanyInfoCard
              profile={displayProfile}
              isEditing={isEditing}
              errors={formErrors}
              onChange={handleDraftChange}
            />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="contact">
            <ContactInfoCard
              profile={displayProfile}
              isEditing={isEditing}
              errors={formErrors}
              onChange={handleDraftChange}
            />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="schedule">
            <WorkingScheduleCard
              profile={displayProfile}
              isEditing={isEditing}
              errors={{
                workingDays: formErrors.workingDays,
                closingTime: formErrors.closingTime,
              }}
              onChange={handleDraftChange}
            />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="documents">
            <DocumentsComplianceCard
              profile={displayProfile}
              onUpload={(docKey) =>
                showToast(
                  t("logisticsProfile.feedback.uploadSoon", {
                    label: translateDocumentUploadLabel(t, docKey),
                  }),
                )
              }
            />
          </LogisticsProfileSection>

          {isEditing ? (
            <LogisticsProfileSection id="actions">
              <ProfileActionsBar
                isSaving={isSaving}
                onCancel={cancelEdit}
                onSave={handleSave}
              />
            </LogisticsProfileSection>
          ) : null}
        </LogisticsProfileLeftColumn>

        <LogisticsProfileRightColumn>
          <LogisticsProfileSection id="operations">
            <OperationsCapacityCard
              profile={displayProfile}
              isEditing={isEditing}
              onChange={handleDraftChange}
            />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="coverage">
            <ServiceCoverageCard
              profile={displayProfile}
              isEditing={isEditing}
              onChange={handleDraftChange}
            />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="preview">
            <PublicCompanyPreview profile={displayProfile} />
          </LogisticsProfileSection>

          <LogisticsProfileSection id="trust">
            <TrustVerificationCard profile={displayProfile} />
          </LogisticsProfileSection>
        </LogisticsProfileRightColumn>
      </LogisticsProfileMainGrid>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="agrivo-profile-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="agrivo-heading text-lg font-bold text-[#102018]">
              {t("logisticsProfile.changeLogoTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#5F6F64]">
              {t("logisticsProfile.changeLogoDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => setPhotoDialogOpen(false)}
            >
              {t("logisticsProfile.actions.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
