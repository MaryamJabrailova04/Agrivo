import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { allFarmers, getFarmerBySlug, type FarmerProfile } from "../data/farmers";
import { getJobsByFarmerSlug } from "../data/farmJobsStorage";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { FeaturedFarmerCard } from "../components/FeaturedFarmerCard";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  VERIFICATION_ITEM_KEYS,
  formatFarmerExperienceLine,
  formatJobPay,
  formatLocalizedJobDateRange,
  localizeFarmerProduct,
  translateFarmDetailValue,
  translateFarmerAbout,
  translateFarmerCategory,
  translateFarmerLocation,
  translateFarmerReview,
} from "../../i18n/farmerHelpers";
import { translateJobLocation, translateJobTitle } from "../../i18n/jobHelpers";

interface FarmerProfilePageProps {
  slug: string;
}

const VERIFICATION_ICONS = [BadgeCheck, MapPin, ShieldCheck, Truck] as const;

const FARM_DETAIL_FIELDS: Array<{
  key: keyof FarmerProfile["farmDetails"];
  labelKey: string;
}> = [
  { key: "farmName", labelKey: "farmerDetail.farmDetails.farmName" },
  { key: "location", labelKey: "farmerDetail.farmDetails.location" },
  { key: "farmSize", labelKey: "farmerDetail.farmDetails.farmSize" },
  { key: "experience", labelKey: "farmerDetail.farmDetails.experience" },
  { key: "mainProducts", labelKey: "farmerDetail.farmDetails.mainProducts" },
  { key: "minimumOrder", labelKey: "farmerDetail.farmDetails.minimumOrder" },
  { key: "deliverySupport", labelKey: "farmerDetail.farmDetails.deliverySupport" },
  { key: "harvestSeason", labelKey: "farmerDetail.farmDetails.harvestSeason" },
];

function BackToFarmers() {
  const { t } = useLanguage();

  return (
    <div className="agrivo-farmer-profile-back">
      <div className="agrivo-container">
        <button
          type="button"
          onClick={() => {
            navigateToHash("farmers");
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5F6F64] transition hover:text-[#14532D]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("farmerDetail.backToFarmers")}
        </button>
      </div>
    </div>
  );
}

function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="agrivo-shell agrivo-farmer-profile-page min-h-screen overflow-x-hidden">
      <AgrivoNavbar activeItem="farmers" />
      <div className="agrivo-header-spacer" aria-hidden="true" />
      <BackToFarmers />
      <div className="agrivo-container py-16 text-center">
        <h1 className="agrivo-heading text-2xl text-[#102018]">{t("farmers.notFound")}</h1>
        <p className="mt-3 text-[#5F6F64]">{t("farmers.notFoundDesc")}</p>
        <Button
          className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={() => {
            navigateToHash("farmers");
          }}
        >
          {t("farmerDetail.backToFarmers")}
        </Button>
      </div>
    </div>
  );
}

function ProfileHero({ farmer }: { farmer: FarmerProfile }) {
  const { t } = useLanguage();
  const whatsappUrl = buildWhatsAppUrl(farmer.whatsapp, farmer.name);

  return (
    <section className="agrivo-farmer-profile-hero">
      <div className="agrivo-container">
        <div className="agrivo-farmer-profile-hero-card">
          <div className="agrivo-farmer-profile-hero-grid">
            <div className="agrivo-farmer-profile-photo-wrap">
              <ImageWithFallback
                src={farmer.image}
                alt={farmer.name}
                className="agrivo-farmer-profile-photo"
              />
            </div>

            <div className="agrivo-farmer-profile-hero-content">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl lg:text-[2rem]">
                  {farmer.name}
                </h1>
                <Badge className="rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534] hover:bg-[#ecfdf5]">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                  {t("farmerDetail.verifiedFarmer")}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5F6F64]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-[#43A047]" />
                  {translateFarmerLocation(t, farmer.location)}
                </span>
                <span>{formatFarmerExperienceLine(t, farmer.experience)}</span>
                <span className="font-medium text-[#14532D]">
                  {translateFarmerCategory(t, farmer.category)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="agrivo-farmer-profile-stat">
                  <div className="flex items-center gap-1.5 text-[#14532D]">
                    <Star className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                    <span className="text-base font-bold sm:text-lg">{farmer.rating}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#6b7a70]">{t("farmerDetail.rating")}</p>
                </div>
                <div className="agrivo-farmer-profile-stat">
                  <p className="text-base font-bold text-[#14532D] sm:text-lg">{farmer.completedOrders}</p>
                  <p className="mt-0.5 text-xs text-[#6b7a70]">{t("farmerDetail.completedOrders")}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  className="agrivo-button-soft w-full rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5d] sm:w-auto"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="mr-2 h-4 w-4" />
                    {t("farmerDetail.contactWhatsapp")}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#dbe7d4] bg-white text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
                  onClick={() => {
                    const section = document.getElementById("farmer-products");
                    if (!section) return;
                    const top = section.getBoundingClientRect().top + window.scrollY - 88;
                    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {t("farmerDetail.viewProducts")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FarmerProfilePage({ slug }: FarmerProfilePageProps) {
  const { t, language } = useLanguage();
  const farmer = getFarmerBySlug(slug);

  if (!farmer) {
    return (
      <div className="agrivo-shell min-h-screen">
        <NotFound />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(farmer.whatsapp, farmer.name);
  const otherFarmers = allFarmers.filter((item) => item.slug !== farmer.slug).slice(0, 2);
  const activeJobs = getJobsByFarmerSlug(farmer.slug);

  return (
    <div className="agrivo-shell agrivo-farmer-profile-page min-h-screen overflow-x-hidden">
      <AgrivoNavbar activeItem="farmers" />
      <div className="agrivo-header-spacer" aria-hidden="true" />
      <BackToFarmers />
      <ProfileHero farmer={farmer} />

      <section className="agrivo-farmer-profile-section">
        <div className="agrivo-container max-w-4xl">
          <h2 className="agrivo-heading agrivo-section-title text-[#102018]">
            {t("farmerDetail.about.title")}
          </h2>
          <p className="mt-4 text-base leading-8 text-[#5F6F64]">{translateFarmerAbout(t, farmer)}</p>
        </div>
      </section>

      <section className="agrivo-farmer-profile-section bg-[#f8faf4]">
        <div className="agrivo-container">
          <h2 className="agrivo-heading agrivo-section-title mb-5 text-[#102018] sm:mb-6">
            {t("farmerDetail.farmDetails.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FARM_DETAIL_FIELDS.map(({ key, labelKey }) => (
              <Card key={key} className="rounded-[24px] border border-[#e5efe1] bg-white">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-sm text-[#5F6F64]">{t(labelKey)}</p>
                  <p className="mt-2 font-semibold text-[#102018]">
                    {translateFarmDetailValue(t, key, farmer.farmDetails[key])}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="farmer-products" className="agrivo-farmer-profile-section agrivo-scroll-anchor">
        <div className="agrivo-container">
          <h2 className="agrivo-heading agrivo-section-title mb-5 text-[#102018] sm:mb-6">
            {t("farmerDetail.products.title")}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {farmer.products.map((product) => {
              const display = localizeFarmerProduct(t, product);
              return (
                <Card key={product.name} className="agrivo-card rounded-[28px] border border-[#e5efe1] bg-white">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge className="rounded-full bg-[#ecfdf5] text-[#166534] hover:bg-[#ecfdf5]">
                          {display.category}
                        </Badge>
                        <h3 className="mt-3 text-xl font-semibold text-[#102018]">{display.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-[#5F6F64]">{display.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#14532D]">
                          {display.price}{" "}
                          <span className="text-sm font-medium">{display.unit}</span>
                        </p>
                        <p className="mt-1 text-sm text-[#5F6F64]">
                          {t("farmerDetail.products.availableLabel").replace("{quantity}", display.available)}
                        </p>
                      </div>
                    </div>
                    <Button asChild className="mt-5 w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B] sm:w-auto">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        {t("farmerDetail.products.contactForOrder")}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {activeJobs.length > 0 ? (
        <section className="agrivo-farmer-profile-section bg-[#f8faf4]">
          <div className="agrivo-container">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
                  {t("farmerDetail.jobs.eyebrow")}
                </p>
                <h2 className="agrivo-heading agrivo-section-title mt-2 text-[#102018]">
                  {t("farmerDetail.jobs.title")}
                </h2>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={() => {
                  navigateToHash("jobs");
                }}
              >
                {t("farmerDetail.jobs.browseAllJobs")}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeJobs.map((job) => (
                <Card
                  key={job.id}
                  className="agrivo-card cursor-pointer rounded-[28px] border border-[#e5efe1] bg-white transition hover:border-[#bbf7d0]"
                  onClick={() => {
                    navigateToHash(`jobs/${job.slug}`);
                  }}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                        <Briefcase className="h-5 w-5 text-[#14532D]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#102018]">{translateJobTitle(t, job)}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5F6F64]">
                          <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                          {translateJobLocation(t, job.location)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          <span className="font-bold text-[#14532D]">{formatJobPay(t, job.dailyPay)}</span>
                          <span className="text-[#5F6F64]">
                            {formatLocalizedJobDateRange(language, job.startDate, job.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="agrivo-farmer-profile-section bg-[#ecfdf5]">
        <div className="agrivo-container">
          <h2 className="agrivo-heading agrivo-section-title mb-5 text-[#102018] sm:mb-6">
            {t("farmerDetail.verification.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VERIFICATION_ITEM_KEYS.map((labelKey, index) => {
              const Icon = VERIFICATION_ICONS[index];
              return (
                <div key={labelKey} className="flex items-center gap-3 rounded-[24px] border border-[#d6f5e3] bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                    <Icon className="h-5 w-5 text-[#14532D]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    <span className="text-sm font-medium text-[#102018]">{t(labelKey)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="agrivo-farmer-profile-section">
        <div className="agrivo-container max-w-4xl">
          <h2 className="agrivo-heading agrivo-section-title mb-5 text-[#102018] sm:mb-6">
            {t("farmerDetail.reviews.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {farmer.reviews.map((review) => (
              <Card key={review.author} className="rounded-[24px] border border-[#e5efe1] bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#102018]">{review.author}</p>
                    <div className="flex items-center gap-1 text-[#14532D]">
                      <Star className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                      <span className="text-sm font-bold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5F6F64]">{translateFarmerReview(t, review)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {otherFarmers.length > 0 && (
        <section className="agrivo-farmer-profile-section border-t border-[#e5efe1] bg-[#f8faf4]">
          <div className="agrivo-container">
            <h2 className="agrivo-heading agrivo-section-title mb-5 text-center text-[#102018] sm:mb-6">
              {t("farmerDetail.moreFarmers.title")}
            </h2>
            <div className="agrivo-farmer-grid">
              {otherFarmers.map((item) => (
                <FeaturedFarmerCard
                  key={item.slug}
                  farmer={item}
                  onViewProfile={(nextSlug) => {
                    navigateToHash(`farmers/${nextSlug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
