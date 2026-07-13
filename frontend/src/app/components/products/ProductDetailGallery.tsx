import { useMemo, useState } from "react";
import { resolveProductImage } from "../../utils/productImages";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ProductSaveButton } from "./ProductSaveButton";
import { cn } from "../ui/utils";

function buildGallerySources(src: string): string[] {
  const trimmed = src.trim();
  if (!trimmed) return [];

  if (trimmed.includes("images.unsplash.com")) {
    const base = trimmed.split("?")[0];
    return [
      `${base}?auto=format&fit=crop&w=1200&h=1200&q=80&crop=center`,
      `${base}?auto=format&fit=crop&w=1200&h=1200&q=80&crop=top`,
      `${base}?auto=format&fit=crop&w=1200&h=1200&q=80&crop=entropy`,
    ];
  }

  return [trimmed];
}

interface ProductDetailGalleryProps {
  slug: string;
  name: string;
  src?: string | null;
  category?: string;
  className?: string;
}

export function ProductDetailGallery({
  slug,
  name,
  src,
  category,
  className,
}: ProductDetailGalleryProps) {
  const resolved = resolveProductImage(name, src, category);
  const gallery = useMemo(() => buildGallerySources(resolved), [resolved]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = gallery[Math.min(activeIndex, gallery.length - 1)] ?? resolved;

  return (
    <div className={cn("agrivo-product-detail-gallery", className)}>
      <div className="agrivo-product-detail-gallery__stage">
        <div className="agrivo-product-detail-gallery__main">
          <ImageWithFallback
            src={activeSrc}
            alt={`${name} product image`}
            productName={name}
            category={category}
            fallbackSrc={resolved}
            className="agrivo-product-detail-gallery__image"
          />
        </div>
        <ProductSaveButton slug={slug} className="agrivo-product-save-btn--overlay" />
      </div>

      {gallery.length > 1 ? (
        <div className="agrivo-product-detail-gallery__thumbs" role="list">
          {gallery.map((thumbSrc, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${thumbSrc}-${index}`}
                type="button"
                role="listitem"
                className={cn(
                  "agrivo-product-detail-gallery__thumb",
                  isActive && "agrivo-product-detail-gallery__thumb--active",
                )}
                aria-label={`View image ${index + 1}`}
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
              >
                <ImageWithFallback
                  src={thumbSrc}
                  alt=""
                  productName={name}
                  category={category}
                  fallbackSrc={resolved}
                  className="agrivo-product-detail-gallery__thumb-image"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
