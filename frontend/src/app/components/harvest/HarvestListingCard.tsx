import { useMemo } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  localizeHarvestListing,
  translateTag,
  VERIFIED_FARMER_TAG,
} from "../../../i18n/marketplaceHelpers";
import { ProductImage } from "../products/ProductImage";
import { ProductSaveButton } from "../products/ProductSaveButton";
import { ProductAddToCartButton } from "../products/ProductAddToCartButton";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import type { HarvestListing } from "../../data/harvestExplorer";
import { districtShortName } from "../../data/harvestExplorerUtils";
import { ProductVarietyBadge } from "../products/ProductVarietyBadge";

interface HarvestListingCardProps {
  listing: HarvestListing;
  onViewDetails: () => void;
  onContactSeller: () => void;
  compact?: boolean;
  selected?: boolean;
}

export function HarvestListingCard({
  listing,
  onViewDetails,
  onContactSeller,
  compact = false,
  selected = false,
}: HarvestListingCardProps) {
  const { t } = useLanguage();
  const display = useMemo(() => localizeHarvestListing(t, listing), [t, listing]);

  const rawTopBadge =
    listing.tags.find((tag) => tag !== VERIFIED_FARMER_TAG) ??
    (listing.farmerVerified ? VERIFIED_FARMER_TAG : listing.tags[0]);

  const topBadge = rawTopBadge ? translateTag(t, rawTopBadge) : null;

  const detailTags = display.tags
    .filter((tag) => tag !== topBadge)
    .slice(0, 2);

  const locationText = `${listing.economicRegion} > ${districtShortName(listing.district)}${
    listing.village ? ` > ${listing.village}` : ""
  }`;

  return (
    <Card
      className={cn(
        "agrivo-product-card agrivo-card agrivo-harvest-card agrivo-product-card--interactive flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-[#e5efe1] bg-white shadow-[0_12px_32px_rgba(20,83,45,0.05)]",
        compact ? "agrivo-harvest-card--compact min-h-0" : "min-h-[540px]",
        selected && "agrivo-harvest-card--selected border-[#14532D] ring-2 ring-[#14532D]/15",
      )}
    >
      <div className="relative shrink-0 p-3 pb-0">
        <div
          className={cn(
            "agrivo-product-image relative aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-[#eef4ea]",
            compact ? "h-[180px]" : "h-[232px]",
          )}
        >
          <ProductImage
            name={display.name}
            src={listing.image}
            category={listing.productType}
            alt={`${display.name} product image`}
            className="h-full w-full"
          />
        </div>

        {topBadge ? (
          <span className="agrivo-product-badge agrivo-product-badge--overlay">{topBadge}</span>
        ) : null}
        <ProductSaveButton listing={listing} slug={listing.slug} className="agrivo-product-save-btn--overlay" />
      </div>

      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="agrivo-product-region flex items-center gap-1.5 text-sm text-[#6b7a70]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
          <span className="truncate">{locationText}</span>
        </p>

        <div className="agrivo-product-title-block">
          <h3
            className={cn(
              "agrivo-product-name line-clamp-2 font-bold leading-snug text-[#102018]",
              compact ? "min-h-[2.5rem] text-base" : "min-h-[2.75rem] text-lg sm:text-xl",
            )}
          >
            {display.name}
          </h3>

          <ProductVarietyBadge variety={display.variety} label={t("marketplace.card.variety")} />
        </div>

        <p className="agrivo-product-farmer line-clamp-1 text-sm text-[#6b7a70]">
          {listing.farmer}
        </p>

        <div className="agrivo-harvest-card-meta mt-3 grid grid-cols-2 gap-x-3">
          <div>
            <p className="agrivo-harvest-card-meta-label">{t("marketplace.card.quantity")}</p>
            <p className="agrivo-harvest-card-meta-value">{listing.quantity}</p>
          </div>
          <div>
            <p className="agrivo-harvest-card-meta-label">{t("marketplace.card.harvested")}</p>
            <p className="agrivo-harvest-card-meta-value">{display.harvestDate}</p>
          </div>
        </div>

        <p
          className={cn(
            "agrivo-product-price mt-3 font-bold tracking-tight text-[#14532d]",
            compact ? "text-lg" : "text-xl",
          )}
        >
          {listing.pricePerKg}
        </p>

        {detailTags.length > 0 ? (
          <div className="agrivo-harvest-card-tags mt-2.5">
            {detailTags.map((tag) => (
              <span key={tag} className="agrivo-harvest-card-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="agrivo-harvest-card-footer mt-auto pt-4">
          <Button
            variant="outline"
            className="agrivo-button-soft agrivo-harvest-card-btn agrivo-harvest-card-btn--secondary agrivo-harvest-card-btn--details h-11 rounded-full text-sm font-semibold"
            onClick={onViewDetails}
          >
            {t("marketplace.card.viewDetails")}
          </Button>
          <ProductAddToCartButton
            listing={listing}
            className="agrivo-button-soft agrivo-harvest-card-btn agrivo-harvest-card-btn--primary agrivo-harvest-card-btn--cart h-11 w-full rounded-full bg-[#14532d] text-sm font-semibold text-white hover:bg-[#1b6b3f]"
            label={t("marketplace.card.addToCart")}
          />
        </div>
        <Button
          className="agrivo-button-soft agrivo-harvest-card-btn agrivo-harvest-card-btn--primary mt-2.5 h-11 w-full rounded-full bg-[#ecfdf5] text-sm font-semibold text-[#14532D] hover:bg-[#d1fae5]"
          onClick={onContactSeller}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("marketplace.card.contactSeller")}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
