import { BadgeCheck, MapPin, Star } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  translateFarmerCategory,
  translateFarmerSpecialty,
} from "../../i18n/farmerHelpers";
import { translateLandingExperience } from "../../i18n/landingHelpers";
import type { FarmerProfile } from "../data/farmers";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface FeaturedFarmerCardProps {
  farmer: FarmerProfile;
  onViewProfile: (slug: string) => void;
}

export function FeaturedFarmerCard({ farmer, onViewProfile }: FeaturedFarmerCardProps) {
  const { t } = useLanguage();
  const whatsappUrl = buildWhatsAppUrl(farmer.whatsapp, farmer.name);

  return (
    <Card className="agrivo-farmer-card agrivo-card h-full overflow-hidden rounded-[30px] border border-[#e5efe1] bg-white shadow-[0_12px_32px_rgba(20,83,45,0.06)]">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <ImageWithFallback
            src={farmer.image}
            alt={farmer.name}
            className="h-20 w-20 shrink-0 rounded-[22px] object-cover sm:h-24 sm:w-24"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[#102018] sm:text-xl">{farmer.name}</h3>
              <Badge className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[0.7rem] text-[#166534] hover:bg-[#ecfdf5] sm:text-xs">
                <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                {t("farmersPage.card.verified")}
              </Badge>
            </div>
            <div className="agrivo-farmer-meta mt-2 flex items-center text-sm text-[#5F6F64] sm:text-base">
              <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-[#22c55e]" />
              {farmer.village ? `${farmer.village}, ${farmer.districtCity}` : farmer.districtCity}
            </div>
            <p className="mt-1 text-sm font-medium text-[#43A047] sm:text-base">
              {translateFarmerCategory(t, farmer.category)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-[22px] bg-[#f8faf4] p-3 sm:gap-3 sm:p-4">
          <div>
            <div className="agrivo-farmer-stat-value flex items-center gap-1 text-[#14532D]">
              <Star className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
              <span className="font-bold">{farmer.rating}</span>
            </div>
            <p className="agrivo-farmer-stat-label mt-1 text-[#5F6F64]">{t("farmersPage.card.rating")}</p>
          </div>
          <div>
            <p className="agrivo-farmer-stat-value font-bold text-[#14532D]">{farmer.completedOrders}</p>
            <p className="agrivo-farmer-stat-label mt-1 text-[#5F6F64]">{t("farmersPage.card.orders")}</p>
          </div>
          <div>
            <p className="agrivo-farmer-stat-value font-bold text-[#14532D]">
              {translateLandingExperience(t, farmer.experience)}
            </p>
            <p className="agrivo-farmer-stat-label mt-1 text-[#5F6F64]">{t("farmersPage.card.experience")}</p>
          </div>
        </div>

        <div className="mt-5 flex-1">
          <p className="agrivo-farmer-meta text-base font-medium text-[#5F6F64]">
            {t("farmersPage.card.specializesIn")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {farmer.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="rounded-full bg-white px-3 py-1 text-[#14532d] shadow-sm">
                {translateFarmerSpecialty(t, specialty)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="outline"
            className="agrivo-button-soft w-full rounded-full border-[#14532d] bg-white text-[#14532d] hover:bg-[#ecfdf5]"
            onClick={() => onViewProfile(farmer.slug)}
          >
            {t("farmersPage.card.viewProfile")}
          </Button>
          <Button
            asChild
            className="agrivo-button-soft w-full rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5d]"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="mr-2 h-4 w-4" />
              {t("farmersPage.card.contactWhatsapp")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
