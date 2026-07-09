import { Calendar, MapPin, Users } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  formatJobPay,
  formatLocalizedJobDateRange,
  formatWorkersNeeded,
  getLocalizedBenefitTags,
  translateCropType,
  translateJobLocation,
  translateJobTitle,
  translateJobType,
} from "../../../i18n/jobHelpers";
import { translateJobPostStatus } from "../../../i18n/farmerJobFormHelpers";
import { getJobBenefitTags, type FarmJob } from "../../data/farmJobs";
import { buildJobWhatsAppUrl } from "../../utils/jobWhatsApp";
import { WhatsAppIcon } from "../WhatsAppIcon";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface FarmJobCardProps {
  job: FarmJob;
  variant?: "grid" | "dashboard";
  onViewDetails?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
}

export function FarmJobCard({
  job,
  variant = "grid",
  onViewDetails,
  onEdit,
  onClose,
  onDelete,
}: FarmJobCardProps) {
  const { t, language } = useLanguage();
  const benefitTags = getLocalizedBenefitTags(t, getJobBenefitTags(job));
  const whatsappUrl = buildJobWhatsAppUrl(job.whatsapp, job.title);
  const localizedTitle = translateJobTitle(t, job);
  const localizedLocation = translateJobLocation(t, job.location);
  const localizedDateRange = formatLocalizedJobDateRange(language, job.startDate, job.endDate);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
      return;
    }
    navigateToHash(`jobs/${job.slug}`);
  };

  return (
    <Card className="agrivo-job-card agrivo-card flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]">
      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="agrivo-heading text-lg font-bold leading-snug text-[#102018] sm:text-xl">
              {localizedTitle}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#14532D]">{job.farmerName}</p>
          </div>
          {variant === "dashboard" ? (
            <Badge
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                job.status === "active"
                  ? "border border-[#bbf7d0] bg-[#ecfdf5] text-[#166534] hover:bg-[#ecfdf5]"
                  : "border border-[#e5e7eb] bg-[#f3f4f6] text-[#6b7280] hover:bg-[#f3f4f6]"
              }`}
            >
              {translateJobPostStatus(t, job.status)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-2 text-sm text-[#5F6F64]">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#43A047]" />
            {localizedLocation}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#43A047]" />
            {localizedDateRange}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-[#43A047]" />
            {formatWorkersNeeded(t, job.workersNeeded)}
          </p>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#dbe7d4] bg-[#f6fbf4] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
            {t("jobs.page.card.dailyPay")}
          </p>
          <p className="mt-0.5 text-2xl font-bold text-[#14532D]">{formatJobPay(t, job.dailyPay)}</p>
        </div>

        <div className="mt-4 flex min-h-[4.75rem] flex-1 flex-wrap content-start gap-2">
          <Badge className="rounded-full border-0 bg-[#EAF7EC] px-3 py-1 text-xs font-medium text-[#14532D] hover:bg-[#EAF7EC]">
            {translateJobType(t, job.jobType)}
          </Badge>
          <Badge className="rounded-full border-0 bg-[#f0f7ee] px-3 py-1 text-xs font-medium text-[#166534] hover:bg-[#f0f7ee]">
            {translateCropType(t, job.cropType)}
          </Badge>
          {benefitTags.slice(0, variant === "dashboard" ? 4 : 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-full border-[#dbe7d4] bg-white px-3 py-1 text-xs font-medium text-[#3f5247]"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {variant === "dashboard" && job.applicantsCount > 0 ? (
          <p className="mt-3 text-xs font-medium text-[#6b7a70]">
            {job.applicantsCount === 1
              ? t("farmerJobsDashboard.applicantsOne", { count: job.applicantsCount })
              : t("farmerJobsDashboard.applicantsMany", { count: job.applicantsCount })}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          {variant === "dashboard" ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={handleViewDetails}
              >
                {t("jobs.viewDetails")}
              </Button>
              {onEdit ? (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={onEdit}
                >
                  {t("farmerJobsDashboard.edit")}
                </Button>
              ) : null}
              {job.status === "active" && onClose ? (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-[#dbe7d4] text-[#5F6F64] hover:bg-[#f3f4f6]"
                  onClick={onClose}
                >
                  {t("farmerJobsDashboard.closeJob")}
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]"
                  onClick={onDelete}
                >
                  {t("farmerJobsDashboard.delete")}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button
                className="agrivo-button-soft flex-1 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                onClick={handleViewDetails}
              >
                {t("jobs.page.card.viewDetails")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full border-[#25D366] bg-[#f0fdf4] text-[#14532D] hover:bg-[#dcfce7]"
                onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                {t("jobs.page.card.applyWhatsapp")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
