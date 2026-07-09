import { ArrowRight, BadgeCheck, MapPin, Sprout, Star } from "lucide-react";
import type { FarmJob } from "../../data/farmJobs";
import type { FarmerProfile } from "../../data/farmers";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatFarmerExperienceLine,
  translateFarmerAbout,
  translateFarmerSpecialty,
} from "../../../i18n/farmerHelpers";
import { navigateToFarmerProfile } from "../../utils/jobFarmer";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface JobFarmerCardProps {
  job: FarmJob;
  farmer: FarmerProfile | null;
  otherJobsCount?: number;
  compact?: boolean;
}

function getSpecializationLabel(
  t: ReturnType<typeof useLanguage>["t"],
  farmer: FarmerProfile | null,
  job: FarmJob,
): string {
  if (farmer?.specialties.length) {
    return farmer.specialties.map((item) => translateFarmerSpecialty(t, item)).join(", ");
  }
  return translateFarmerSpecialty(t, job.cropType);
}

function getLocationLine(farmer: FarmerProfile | null, job: FarmJob): string {
  if (farmer) {
    const parts = [farmer.economicRegion, farmer.districtCity, farmer.village].filter(Boolean);
    return parts.join(" · ");
  }
  return [job.economicRegion, job.district, job.village].filter(Boolean).join(" · ");
}

function getBioLine(t: ReturnType<typeof useLanguage>["t"], farmer: FarmerProfile | null): string {
  if (!farmer) return t("farmJobDetail.farmerCard.fallbackBio");
  const about = translateFarmerAbout(t, farmer);
  const sentence = about.split(".")[0];
  return sentence ? `${sentence}.` : about;
}

export function JobFarmerCard({ job, farmer, otherJobsCount = 0, compact = false }: JobFarmerCardProps) {
  const { t } = useLanguage();
  const farmerSlug = farmer?.slug ?? job.farmerSlug;
  const image = farmer?.image ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80";
  const experience = farmer
    ? formatFarmerExperienceLine(t, farmer.experience)
    : t("farmJobDetail.farmerCard.experiencedGrower");
  const rating = farmer?.rating;

  const handleViewProfile = () => {
    if (farmerSlug) navigateToFarmerProfile(farmerSlug);
  };

  const otherJobsLabel =
    otherJobsCount === 1
      ? t("farmJobDetail.sections.otherJobs").replace("{count}", String(otherJobsCount))
      : t("farmJobDetail.sections.otherJobsPlural").replace("{count}", String(otherJobsCount));

  return (
    <Card className="agrivo-job-farmer-card overflow-hidden rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]">
      <CardContent className={compact ? "p-5" : "p-6 sm:p-7"}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
          {t("farmJobDetail.farmerCard.postedBy")}
        </p>

        <button
          type="button"
          onClick={farmerSlug ? handleViewProfile : undefined}
          className={`mt-4 flex w-full items-start gap-4 rounded-[22px] border border-[#edf2ea] bg-[#f8faf4] p-4 text-left transition ${
            farmerSlug ? "hover:border-[#bbf7d0] hover:bg-[#f0fdf4]" : ""
          }`}
        >
          <ImageWithFallback
            src={image}
            alt={job.farmerName}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm sm:h-20 sm:w-20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="agrivo-heading text-lg font-bold text-[#102018] hover:text-[#14532D] sm:text-xl">
                {job.farmerName}
              </h3>
              {job.farmerVerified ? (
                <Badge className="rounded-full bg-[#ecfdf5] text-[#166534] hover:bg-[#ecfdf5]">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                  {t("farmJobDetail.farmerCard.verified")}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-[#5F6F64]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#43A047]" />
              {getLocationLine(farmer, job)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#14532D]">
              <Sprout className="h-3.5 w-3.5 text-[#43A047]" />
              {getSpecializationLabel(t, farmer, job)}
            </p>
          </div>
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-3 py-2.5">
            <p className="text-xs text-[#6b7a70]">{t("farmJobDetail.farmerCard.experience")}</p>
            <p className="mt-0.5 text-sm font-semibold text-[#102018]">{experience}</p>
          </div>
          {rating ? (
            <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-3 py-2.5">
              <p className="text-xs text-[#6b7a70]">{t("farmJobDetail.farmerCard.rating")}</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-[#102018]">
                <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" />
                {rating}
              </p>
            </div>
          ) : (
            <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-3 py-2.5">
              <p className="text-xs text-[#6b7a70]">{t("farmJobDetail.farmerCard.listing")}</p>
              <p className="mt-0.5 text-sm font-semibold text-[#102018]">
                {t("farmJobDetail.farmerCard.agrivoVerified")}
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-[#5F6F64]">{getBioLine(t, farmer)}</p>

        {farmerSlug ? (
          <div className="mt-5 flex flex-col gap-2">
            <Button
              className="agrivo-button-soft w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={handleViewProfile}
            >
              {t("farmJobDetail.farmerCard.viewProfile")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {otherJobsCount > 0 ? (
              <Button
                variant="outline"
                className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={handleViewProfile}
              >
                {otherJobsLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
