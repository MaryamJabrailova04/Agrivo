import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { JobFarmerCard } from "../components/jobs/JobFarmerCard";
import { JobLocationMap } from "../components/jobs/JobLocationMap";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { getJobBySlugFromAll, getJobsByFarmerSlug } from "../data/farmJobsStorage";
import { buildJobWhatsAppUrl } from "../utils/jobWhatsApp";
import { resolveFarmerForJob, navigateToFarmerProfile } from "../utils/jobFarmer";
import { isLoggedIn } from "../auth/authStorage";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  formatJobPay,
  formatJobWorkersPeople,
  formatLocalizedJobDateRange,
  formatPostedAgo,
  translateCropType,
  translateJobDescription,
  translateJobIncludedItem,
  translateJobLocation,
  translateJobRequirement,
  translateJobTitle,
  translateJobType,
} from "../../i18n/jobHelpers";

interface JobDetailPageProps {
  slug: string;
}

function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="agrivo-container py-20 text-center">
      <h1 className="agrivo-heading text-2xl text-[#102018]">{t("farmJobDetail.notFound")}</h1>
      <p className="mt-3 text-[#5F6F64]">{t("farmJobDetail.notFoundDesc")}</p>
      <Button
        className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
        onClick={() => navigateToHash("jobs")}
      >
        {t("farmJobDetail.backToJobs")}
      </Button>
    </div>
  );
}

export default function JobDetailPage({ slug }: JobDetailPageProps) {
  const { t, language } = useLanguage();
  const job = getJobBySlugFromAll(slug);

  if (!job || job.status === "closed") {
    return (
      <div className="agrivo-shell agrivo-farm-jobs min-h-screen">
        <AgrivoNavbar activeItem="jobs" />
        <div className="agrivo-header-spacer" aria-hidden="true" />
        <NotFound />
      </div>
    );
  }

  const farmer = resolveFarmerForJob(job);
  const farmerSlug = farmer?.slug ?? job.farmerSlug;
  const whatsappUrl = buildJobWhatsAppUrl(job.whatsapp, job.title);
  const postedLabel = formatPostedAgo(t, language, job.postedAt);
  const localizedTitle = translateJobTitle(t, job);
  const localizedLocation = translateJobLocation(t, job.location);
  const otherJobs = farmerSlug
    ? getJobsByFarmerSlug(farmerSlug).filter((item) => item.slug !== job.slug)
    : [];

  const keyInfo = [
    { labelKey: "farmJobDetail.stats.dailyPay", value: formatJobPay(t, job.dailyPay) },
    {
      labelKey: "farmJobDetail.stats.workersNeeded",
      value: formatJobWorkersPeople(t, job.workersNeeded),
    },
    {
      labelKey: "farmJobDetail.stats.dateRange",
      value: formatLocalizedJobDateRange(language, job.startDate, job.endDate),
    },
    { labelKey: "farmJobDetail.stats.workingHours", value: job.workingHours },
    { labelKey: "farmJobDetail.stats.location", value: localizedLocation },
  ];

  const trustItems = [
    job.farmerVerified ? { icon: BadgeCheck, label: t("farmJobDetail.verifiedFarmer") } : null,
    { icon: MessageCircle, label: t("farmJobDetail.responseWhatsapp") },
    job.economicRegion ? { icon: MapPin, label: job.economicRegion } : null,
    postedLabel ? { icon: ShieldCheck, label: postedLabel } : null,
  ].filter(Boolean) as Array<{ icon: typeof BadgeCheck; label: string }>;

  return (
    <div className="agrivo-shell agrivo-farm-jobs min-h-screen">
      <AgrivoNavbar activeItem="jobs" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <div className="agrivo-container py-8 sm:py-10">
        <button
          type="button"
          onClick={() => navigateToHash("jobs")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#14532D] transition hover:text-[#1D6A3B]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("farmJobDetail.backToJobs")}
        </button>

        <section className="rounded-[32px] border border-[#e5efe1] bg-white p-6 shadow-[0_12px_32px_rgba(20,83,45,0.06)] sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border-0 bg-[#EAF7EC] px-3 py-1 text-xs font-medium text-[#14532D] hover:bg-[#EAF7EC]">
              {translateJobType(t, job.jobType)}
            </Badge>
            <Badge className="rounded-full border-0 bg-[#f0f7ee] px-3 py-1 text-xs font-medium text-[#166534] hover:bg-[#f0f7ee]">
              {translateCropType(t, job.cropType)}
            </Badge>
            {job.urgent ? (
              <Badge className="rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 py-1 text-xs font-medium text-[#b91c1c] hover:bg-[#fef2f2]">
                {t("farmJobDetail.urgent")}
              </Badge>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="agrivo-heading text-3xl font-bold leading-tight text-[#102018] sm:text-4xl">
                {localizedTitle}
              </h1>

              <div className="agrivo-job-posted-by mt-3">
                <p className="text-sm leading-relaxed text-[#6b7a70]">
                  {t("farmJobDetail.postedBy")}{" "}
                  <button
                    type="button"
                    onClick={() => farmerSlug && navigateToFarmerProfile(farmerSlug)}
                    className="font-medium text-[#14532D] transition hover:text-[#1D6A3B] hover:underline"
                  >
                    {job.farmerName}
                  </button>
                  {job.farmerVerified ? (
                    <>
                      <span className="mx-1.5 text-[#c5d4c8]">·</span>
                      <span className="text-[#166534]">{t("farmJobDetail.verifiedFarmer")}</span>
                    </>
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-[#6b7a70]">{localizedLocation}</p>
              </div>
            </div>

            <Button
              className="agrivo-button-soft w-full shrink-0 rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B] sm:w-auto"
              onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
            >
              <WhatsAppIcon className="mr-2 h-4 w-4" />
              {t("farmJobDetail.applyWhatsapp")}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#edf2ea] pt-5">
            {trustItems.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe7d4] bg-[#f6fbf4] px-3 py-1.5 text-xs font-medium text-[#3f5247]"
              >
                <Icon className="h-3.5 w-3.5 text-[#43A047]" />
                {label}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {keyInfo.map((item) => (
            <Card key={item.labelKey} className="rounded-[22px] border border-[#e5efe1] bg-white shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
                  {t(item.labelKey)}
                </p>
                <p className="mt-1.5 text-base font-bold text-[#102018] sm:text-lg">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:gap-8">
          <div className="space-y-6">
            <Card className="rounded-[28px] border border-[#e5efe1] bg-white">
              <CardContent className="p-6 sm:p-7">
                <h2 className="agrivo-heading text-xl font-bold text-[#102018]">
                  {t("farmJobDetail.sections.description")}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#3f5247] sm:text-base">
                  {translateJobDescription(t, job)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-[#e5efe1] bg-white">
              <CardContent className="p-6 sm:p-7">
                <h2 className="agrivo-heading text-xl font-bold text-[#102018]">
                  {t("farmJobDetail.sections.requirements")}
                </h2>
                <ul className="mt-4 space-y-3">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-sm leading-6 text-[#3f5247] sm:text-base">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#43A047]" />
                      {translateJobRequirement(t, req)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-[#e5efe1] bg-white">
              <CardContent className="p-6 sm:p-7">
                <h2 className="agrivo-heading text-xl font-bold text-[#102018]">
                  {t("farmJobDetail.sections.included")}
                </h2>
                <ul className="mt-4 space-y-3">
                  {job.included.length > 0 ? (
                    job.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#3f5247] sm:text-base">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#43A047]" />
                        {translateJobIncludedItem(t, item)}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#5F6F64]">{t("farmJobDetail.sections.includedEmpty")}</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <JobFarmerCard job={job} farmer={farmer} otherJobsCount={otherJobs.length} />
            <JobLocationMap job={job} />
            <Card className="rounded-[28px] border border-[#dbe7d4] bg-[#f6fbf4] shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <p className="text-sm font-medium text-[#102018]">{t("farmJobDetail.sections.readyToApply")}</p>
                <p className="mt-1 text-xs leading-5 text-[#5F6F64]">
                  {t("farmJobDetail.messages.applyWhatsappMessage").replace("{name}", job.farmerName)}
                </p>
                <Button
                  className="agrivo-button-soft mt-4 w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
                >
                  <WhatsAppIcon className="mr-2 h-4 w-4" />
                  {t("farmJobDetail.applyWhatsapp")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {otherJobs.length > 0 ? (
          <section className="mt-10">
            <h2 className="agrivo-heading text-xl font-bold text-[#102018] sm:text-2xl">
              {t("farmJobDetail.sections.moreJobsFrom").replace("{name}", job.farmerName)}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {otherJobs.map((other) => (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => {
                    navigateToHash(`jobs/${other.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-[22px] border border-[#e5efe1] bg-white p-4 text-left shadow-sm transition hover:border-[#bbf7d0] hover:shadow-md sm:p-5"
                >
                  <p className="font-semibold text-[#102018]">{translateJobTitle(t, other)}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5F6F64]">
                    <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                    {translateJobLocation(t, other.location)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-bold text-[#14532D]">{formatJobPay(t, other.dailyPay)}</span>
                    <span className="flex items-center gap-1 text-[#5F6F64]">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatLocalizedJobDateRange(language, other.startDate, other.endDate)}
                    </span>
                    <span className="flex items-center gap-1 text-[#5F6F64]">
                      <Users className="h-3.5 w-3.5" />
                      {formatJobWorkersPeople(t, other.workersNeeded)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="agrivo-job-cta mt-10 rounded-[32px] border border-[#dbe7d4] bg-[#f6fbf4] p-6 text-center sm:p-8">
          <h2 className="agrivo-heading text-2xl font-bold text-[#102018]">
            {t("farmJobDetail.sections.interestedTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#5F6F64] sm:text-base">
            {t("farmJobDetail.messages.interestedDescription").replace("{name}", job.farmerName)}
          </p>
          {!isLoggedIn() ? (
            <p className="mt-2 text-xs text-[#6b7a70]">{t("farmJobDetail.messages.loginToSave")}</p>
          ) : null}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              className="agrivo-button-soft w-full rounded-full bg-[#14532D] px-8 text-white hover:bg-[#1D6A3B] sm:w-auto"
              onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
            >
              <WhatsAppIcon className="mr-2 h-4 w-4" />
              {t("farmJobDetail.applyWhatsapp")}
            </Button>
            {farmerSlug ? (
              <Button
                variant="outline"
                className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
                onClick={() => navigateToFarmerProfile(farmerSlug)}
              >
                {t("farmJobDetail.farmerCard.viewProfile")}
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
              onClick={() => navigateToHash("jobs")}
            >
              {t("farmJobDetail.backToJobs")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
