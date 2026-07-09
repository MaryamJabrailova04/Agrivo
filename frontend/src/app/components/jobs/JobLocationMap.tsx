import { ExternalLink, MapPin, Navigation } from "lucide-react";
import type { FarmJob } from "../../data/farmJobs";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateJobLocation } from "../../../i18n/jobHelpers";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsOpenUrl,
  getJobMapLocation,
} from "../../utils/jobLocation";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface JobLocationMapProps {
  job: FarmJob;
}

export function JobLocationMap({ job }: JobLocationMapProps) {
  const { t } = useLanguage();
  const mapLocation = getJobMapLocation(job);
  const localizedLabel = translateJobLocation(t, job.location);
  const embedUrl = buildGoogleMapsEmbedUrl(mapLocation);
  const openUrl = buildGoogleMapsOpenUrl(mapLocation);
  const directionsUrl = buildGoogleMapsDirectionsUrl(mapLocation);

  return (
    <Card className="agrivo-job-location-map overflow-hidden rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]">
      <CardContent className="p-0">
        <div className="border-b border-[#edf2ea] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
            {t("farmJobDetail.location.title")}
          </p>
          <h2 className="agrivo-heading mt-2 text-lg font-bold text-[#102018] sm:text-xl">
            {t("farmJobDetail.location.whereYouWork")}
          </h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#5F6F64]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#43A047]" />
            {localizedLabel}
          </p>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#eef4ea] sm:aspect-[16/10]">
          <iframe
            title={t("farmJobDetail.location.mapTitle").replace("{location}", localizedLabel)}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-[#edf2ea] p-4 sm:flex-row sm:p-5">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          >
            <a href={openUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("farmJobDetail.location.openGoogleMaps")}
            </a>
          </Button>
          <Button
            asChild
            className="agrivo-button-soft flex-1 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" />
              {t("farmJobDetail.location.getDirections")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
