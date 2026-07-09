import { Briefcase, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardBackLink } from "../components/dashboard/DashboardBackLink";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  FARMER_DASHBOARD_HOME_HASH,
  FARMER_DASHBOARD_JOBS_NEW_HASH,
  FARMER_DASHBOARD,
} from "../components/dashboard/dashboardConfig";
import { ProtectedDashboard } from "../components/dashboard/ProtectedDashboard";
import { FarmJobCard } from "../components/jobs/FarmJobCard";
import { getAuthUser, isFarmerUser } from "../auth/authStorage";
import {
  deleteFarmerJob,
  getFarmerJobs,
  updateJobStatus,
} from "../data/farmJobsStorage";
import { Button } from "../components/ui/button";
import { consumeJobToast } from "../utils/jobToast";

export default function FarmerJobsDashboardPage() {
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const user = getAuthUser();
  const farmer = isFarmerUser();

  useEffect(() => {
    if (!farmer) {
      navigateToHash("login");
    }
  }, [farmer]);

  useEffect(() => {
    const message = consumeJobToast();
    if (message) {
      setToast(message);
      const timer = window.setTimeout(() => setToast(null), 3200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const jobs = useMemo(() => {
    void refreshKey;
    return getFarmerJobs();
  }, [refreshKey]);

  const handleClose = (jobId: string) => {
    if (window.confirm(t("farmerJobsDashboard.closeConfirm"))) {
      updateJobStatus(jobId, "closed");
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm(t("farmerJobsDashboard.deleteConfirm"))) {
      deleteFarmerJob(jobId);
      setRefreshKey((k) => k + 1);
    }
  };

  if (!farmer) {
    return null;
  }

  return (
    <ProtectedDashboard allowedRoles={["farmer"]}>
      <DashboardLayout
        config={FARMER_DASHBOARD}
        pageTitle={t("farmerJobsDashboard.title")}
        pageSubtitle={t("farmerJobsDashboard.subtitle")}
        activeNavId="farm-jobs"
        hideIntro
      >
        {toast ? (
          <div className="agrivo-cart-toast agrivo-cart-toast--success mb-4" role="status">
            <span>{toast}</span>
          </div>
        ) : null}

        <DashboardBackLink
          label={t("farmerJobsDashboard.backToDashboard")}
          hash={FARMER_DASHBOARD_HOME_HASH}
        />

        <div className="agrivo-dashboard-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
                {t("farmerJobsDashboard.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#5F6F64] sm:text-base">
                {t("farmerJobsDashboard.subtitle")}
              </p>
              {user ? (
                <p className="mt-2 text-xs text-[#6b7a70]">
                  {t("farmerJobsDashboard.signedInAs", { name: user.name })}
                </p>
              ) : null}
            </div>
            <Button
              className="agrivo-button-soft rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => {
                navigateToHash(FARMER_DASHBOARD_JOBS_NEW_HASH);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("farmerJobsDashboard.createJobPost")}
            </Button>
          </div>

          {jobs.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <FarmJobCard
                  key={job.id}
                  job={job}
                  variant="dashboard"
                  onEdit={
                    !job.isMock
                      ? () => {
                          navigateToHash(`dashboard/jobs/edit/${job.id}`);
                        }
                      : undefined
                  }
                  onClose={() => handleClose(job.id)}
                  onDelete={() => !job.isMock && handleDelete(job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="agrivo-dashboard-empty mt-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                <Briefcase className="h-6 w-6 text-[#14532D]" />
              </div>
              <h3 className="agrivo-heading text-xl font-bold text-[#102018]">
                {t("farmerJobsDashboard.emptyTitle")}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F64]">
                {t("farmerJobsDashboard.emptyDescription")}
              </p>
              <Button
                className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                onClick={() => {
                  navigateToHash(FARMER_DASHBOARD_JOBS_NEW_HASH);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("farmerJobsDashboard.createJobPost")}
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedDashboard>
  );
}
