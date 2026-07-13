import { useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { cn } from "./ui/utils";
import { ProductImage } from "./products/ProductImage";
import { ProductSaveButton } from "./products/ProductSaveButton";
import { ProductVarietyBadge } from "./products/ProductVarietyBadge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export interface FeaturedProduct {
  name: string;
  location: string;
  farmer: string;
  price: string;
  quantity: string;
  harvestDate: string;
  tags: string[];
  badge?: string;
  image?: string;
  slug?: string;
  variety?: string;
}

interface FeaturedProductCardProps {
  product: FeaturedProduct;
  onViewDetails: () => void;
  onContactSeller: () => void;
}

export function FeaturedProductCard({ product, onViewDetails, onContactSeller }: FeaturedProductCardProps) {
  const { t } = useLanguage();

  const topBadge =
    product.badge ??
    product.tags.find((tag) => tag !== t("landing.tags.verifiedFarmer")) ??
    product.tags[0];

  const detailTags = product.tags.filter((tag) => tag !== topBadge).slice(0, 2);

  const handleCardClick = useCallback(() => {
    onViewDetails();
  }, [onViewDetails]);

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onViewDetails();
    },
    [onViewDetails],
  );

  const stopCardNavigation = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={t(
        "marketplace.card.openProduct",
        { name: product.name },
        `View details for ${product.name}`,
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        "agrivo-product-card agrivo-card agrivo-harvest-card agrivo-product-card--interactive flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[30px] border border-[#e5efe1] bg-white shadow-[0_12px_32px_rgba(20,83,45,0.05)] outline-none",
        "min-h-[540px]",
      )}
    >
      <div className="relative shrink-0 p-3 pb-0">
        <div className="agrivo-product-image relative aspect-[4/3] h-[232px] w-full overflow-hidden rounded-[22px] bg-[#eef4ea]">
          <ProductImage
            name={product.name}
            src={product.image}
            alt={`${product.name} product image`}
            className="h-full w-full"
          />
        </div>

        {topBadge ? (
          <span className="agrivo-product-badge agrivo-product-badge--overlay">{topBadge}</span>
        ) : null}
        {product.slug ? (
          <div onClick={stopCardNavigation}>
            <ProductSaveButton slug={product.slug} className="agrivo-product-save-btn--overlay" />
          </div>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="agrivo-product-region flex items-center gap-1.5 text-sm text-[#6b7a70]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" aria-hidden="true" />
          <span className="truncate">{product.location}</span>
        </p>

        <div className="agrivo-product-title-block">
          <h3 className="agrivo-product-name line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug text-[#102018] sm:text-xl">
            {product.name}
          </h3>
          <ProductVarietyBadge variety={product.variety} />
        </div>

        <p className="agrivo-product-farmer line-clamp-1 text-sm text-[#6b7a70]">{product.farmer}</p>

        <div className="agrivo-harvest-card-meta mt-3 grid grid-cols-2 gap-x-3">
          <div>
            <p className="agrivo-harvest-card-meta-label">{t("landing.products.quantity")}</p>
            <p className="agrivo-harvest-card-meta-value">{product.quantity}</p>
          </div>
          <div>
            <p className="agrivo-harvest-card-meta-label">{t("landing.products.harvested")}</p>
            <p className="agrivo-harvest-card-meta-value">{product.harvestDate}</p>
          </div>
        </div>

        <p className="agrivo-product-price mt-3 text-xl font-bold tracking-tight text-[#14532d]">
          {product.price}
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

        <div className="agrivo-harvest-card-actions mt-auto pt-4">
          <Button
            type="button"
            variant="outline"
            className="agrivo-button-soft agrivo-harvest-card-btn agrivo-harvest-card-btn--secondary w-full"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetails();
            }}
          >
            <span className="truncate">{t("landing.products.viewDetails")}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            className="agrivo-button-soft agrivo-harvest-card-btn agrivo-harvest-card-btn--contact"
            onClick={(event) => {
              event.stopPropagation();
              onContactSeller();
            }}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("landing.products.contactSeller")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
