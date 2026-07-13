import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Leaf,
  MapPin,
  MessageCircle,
  Navigation,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../context/CartContext";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { HarvestListingCard } from "../components/harvest/HarvestListingCard";
import { ProductAddToCartButton } from "../components/products/ProductAddToCartButton";
import { ProductVarietyBadge } from "../components/products/ProductVarietyBadge";
import { ProductDetailGallery } from "../components/products/ProductDetailGallery";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import {
  buildMarketplaceProductDetail,
  type MarketplaceProductDetail,
} from "../data/marketplaceProducts";
import {
  getProductBySlug,
  getProductDetailHash,
  getSimilarProducts,
  type HarvestListing,
} from "../data/harvestExplorer";
import { districtShortName } from "../data/harvestExplorerUtils";
import {
  buildGoogleMapsEmbedUrl,
  buildOriginLocationQuery,
  openGoogleMapsSearch,
} from "../utils/googleMaps";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  formatCartSummary,
  formatLogisticsHandoff,
  localizeProductDetail,
} from "../../i18n/productDetailHelpers";
import { isApiMode } from "../../config/dataMode";
import { getProductById, getProducts, type ApiProduct } from "../../api/productsApi";
import { DeliveryMethodPicker } from "../components/delivery/DeliveryMethodPicker";
import type { DeliveryMethod } from "../data/deliveryTypes";
import {
  getDeliveryMethodQuotes,
  getProductDeliveryMethod,
  setProductDeliveryMethod,
} from "../utils/deliveryOptionsStorage";

interface ProductDetailPageProps {
  slug: string;
}

function navigate(hash: string) {
  navigateToHash(hash);
}

function ProductOriginPreview({ product }: { product: MarketplaceProductDetail }) {
  const { t } = useLanguage();
  const villageLabel = product.village || districtShortName(product.district);
  const districtLabel = districtShortName(product.district);
  const originQuery = useMemo(
    () =>
      buildOriginLocationQuery({
        farmer: product.farmer,
        village: product.village,
        district: product.district,
      }),
    [product.farmer, product.village, product.district],
  );
  const embedUrl = useMemo(() => buildGoogleMapsEmbedUrl(originQuery), [originQuery]);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setMapStatus("loading");
    const timeout = window.setTimeout(() => {
      setMapStatus((current) => (current === "loading" ? "error" : current));
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [embedUrl]);

  const handleOpenMaps = () => {
    openGoogleMapsSearch(originQuery);
  };

  return (
    <div className="agrivo-product-origin">
      <div className="agrivo-product-origin-map">
        {mapStatus !== "error" ? (
          <iframe
            key={embedUrl}
            title={t("productDetail.origin.mapTitle").replace("{farmer}", product.farmer)}
            src={embedUrl}
            className="agrivo-product-origin-map__iframe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setMapStatus("ready")}
          />
        ) : (
          <div className="agrivo-product-origin-map__fallback">
            <MapPin className="h-8 w-8 text-[#43A047]" />
            <p className="mt-3 text-sm font-semibold text-[#102018]">
              {t("productDetail.origin.mapUnavailable")}
            </p>
            <p className="mt-1 text-sm text-[#5F6F64]">{t("productDetail.origin.mapUnavailableHint")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={handleOpenMaps}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("productDetail.origin.openInGoogleMaps")}
            </Button>
          </div>
        )}

        {mapStatus === "loading" ? (
          <div className="agrivo-product-origin-map__loading" aria-hidden="true">
            <span className="agrivo-product-origin-map__loading-pulse" />
          </div>
        ) : null}

        {mapStatus !== "error" ? (
          <div className="agrivo-product-origin-map__overlay">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">
              {t("productDetail.origin.originFarm")}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-[#102018]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
              <span className="truncate">{villageLabel}</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="agrivo-product-origin-meta">
        <div className="agrivo-product-origin-meta-item">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">
            {t("productDetail.origin.economicRegion")}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#102018]">{product.economicRegion}</p>
        </div>
        <div className="agrivo-product-origin-meta-item">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">
            {t("productDetail.origin.district")}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#102018]">{districtLabel}</p>
        </div>
        <div className="agrivo-product-origin-meta-item">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">
            {t("productDetail.origin.village")}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#102018]">{villageLabel}</p>
        </div>
      </div>

      <p className="agrivo-product-origin-farm-line">
        <Leaf className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
        <span>
          {product.farmer}, {districtLabel}, {t("productDetail.origin.country")}
        </span>
      </p>

      <Button
        variant="outline"
        className="mt-4 w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
        onClick={handleOpenMaps}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        {t("productDetail.origin.openInGoogleMaps")}
      </Button>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="agrivo-product-detail-field">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#102018]">{value}</dd>
    </div>
  );
}

function ProductNotFound() {
  const { t } = useLanguage();
  return (
    <div className="agrivo-shell agrivo-product-detail-page min-h-screen overflow-x-hidden bg-[#f8faf4]">
      <AgrivoNavbar activeItem="marketplace" />
      <div className="agrivo-header-spacer" aria-hidden="true" />
      <div className="agrivo-container py-16 text-center">
        <h1 className="agrivo-heading text-2xl font-bold text-[#102018]">{t("product.notFound")}</h1>
        <p className="mt-3 text-[#5F6F64]">{t("product.notFoundDesc")}</p>
        <Button
          className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={() => navigate("products")}
        >
          {t("product.backToMarketplace")}
        </Button>
      </div>
    </div>
  );
}

function ProductLoading() {
  const { t } = useLanguage();
  return (
    <div className="agrivo-shell agrivo-product-detail-page min-h-screen overflow-x-hidden bg-[#f8faf4]">
      <AgrivoNavbar activeItem="marketplace" />
      <div className="agrivo-header-spacer" aria-hidden="true" />
      <div className="agrivo-container py-16 text-center">
        <h1 className="agrivo-heading text-2xl font-bold text-[#102018]">{t("product.loading")}</h1>
      </div>
    </div>
  );
}

function ProductLoadError({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="agrivo-shell agrivo-product-detail-page min-h-screen overflow-x-hidden bg-[#f8faf4]">
      <AgrivoNavbar activeItem="marketplace" />
      <div className="agrivo-header-spacer" aria-hidden="true" />
      <div className="agrivo-container py-16 text-center">
        <h1 className="agrivo-heading text-2xl font-bold text-[#102018]">{t("product.loadError")}</h1>
        <p className="mt-3 text-[#5F6F64]">{message}</p>
        <Button
          className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
          onClick={() => navigate("products")}
        >
          {t("product.backToMarketplace")}
        </Button>
      </div>
    </div>
  );
}

function SimilarProducts({ products }: { products: HarvestListing[] }) {
  const { t } = useLanguage();
  if (products.length === 0) return null;

  return (
    <section className="agrivo-product-detail-section">
      <h2 className="agrivo-heading text-xl font-bold text-[#102018] sm:text-2xl">
        {t("productDetail.sections.similarProducts")}
      </h2>
      <p className="mt-2 text-sm text-[#5F6F64]">{t("productDetail.similar.subtitle")}</p>
      <div className="agrivo-product-detail-similar-grid mt-6">
        {products.map((listing) => (
          <HarvestListingCard
            key={listing.id}
            listing={listing}
            compact
            onViewDetails={() => navigate(getProductDetailHash(listing.slug))}
            onContactSeller={() => {
              if (listing.farmerSlug) {
                navigate(`farmers/${listing.farmerSlug}`);
              } else {
                navigate("login");
              }
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ProductDetailContent({
  product,
  similarProducts,
}: {
  product: MarketplaceProductDetail;
  similarProducts: HarvestListing[];
}) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const display = useMemo(() => localizeProductDetail(t, product), [t, product]);
  const isBuyer = isAuthenticated && user?.role === "buyer";
  const isFarmer = isAuthenticated && user?.role === "farmer";
  const whatsappUrl = product.farmerWhatsapp
    ? buildWhatsAppUrl(product.farmerWhatsapp, product.farmerDisplayName)
    : null;

  const deliveryQuotes = useMemo(
    () => getDeliveryMethodQuotes(product.slug, product.farmerSlug, product.deliveryAvailable),
    [product.slug, product.farmerSlug, product.deliveryAvailable],
  );

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod | null>(() => {
    const saved = getProductDeliveryMethod(product.slug);
    if (saved && deliveryQuotes.some((quote) => quote.method === saved && quote.enabled)) {
      return saved;
    }
    return deliveryQuotes.find((quote) => quote.enabled)?.method ?? null;
  });

  useEffect(() => {
    if (!selectedDeliveryMethod) return;
    setProductDeliveryMethod(product.slug, selectedDeliveryMethod);
  }, [product.slug, selectedDeliveryMethod]);

  const handleContactSeller = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate("login");
  };

  return (
    <div className="agrivo-shell agrivo-product-detail-page min-h-screen overflow-x-hidden bg-[#f8faf4]">
      <AgrivoNavbar activeItem="marketplace" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <div className="agrivo-container pb-16 pt-6">
        <button
          type="button"
          className="agrivo-product-detail-back"
          onClick={() => navigate("products")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("product.backToMarketplace")}
        </button>

        <section className="agrivo-product-detail-hero agrivo-dashboard-panel mt-4">
          <div className="agrivo-product-detail-hero-grid">
            <ProductDetailGallery
              slug={product.slug}
              name={display.name}
              src={product.image}
              category={product.productType}
            />

            <div className="agrivo-product-detail-hero-panel">
              <div className="agrivo-product-detail-summary">
                <span className="agrivo-product-badge inline-flex rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534]">
                  {display.badge}
                </span>

                <h1 className="agrivo-heading agrivo-product-detail-title">
                  {display.name}
                </h1>

                <ProductVarietyBadge
                  variety={display.variety}
                  label={t("productDetail.hero.variety")}
                  size="md"
                  className="mt-2"
                />

                <p className="agrivo-product-detail-location">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#43A047]" />
                  <span>{product.locationPath}</span>
                </p>

                <div className="agrivo-product-detail-seller">
                  <p className="text-sm text-[#5F6F64]">
                    {t("productDetail.hero.farmer")}:{" "}
                    <span className="font-semibold text-[#102018]">{product.farmer}</span>
                  </p>
                  {product.farmerVerified ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#166534]">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {t("productDetail.hero.verifiedFarmer")}
                    </p>
                  ) : null}
                </div>

                <div className="agrivo-product-detail-price-row">
                  <p className="agrivo-heading agrivo-product-detail-price">{product.priceDisplay}</p>
                </div>
              </div>

              <div className="agrivo-product-detail-quick-meta">
                <div className="agrivo-product-detail-quick-stat">
                  <p className="agrivo-product-detail-quick-stat__label">
                    {t("productDetail.hero.availableQuantity")}
                  </p>
                  <p className="agrivo-product-detail-quick-stat__value">{product.quantity}</p>
                </div>
                <div className="agrivo-product-detail-quick-stat">
                  <p className="agrivo-product-detail-quick-stat__label">
                    {t("productDetail.hero.harvested")}
                  </p>
                  <p className="agrivo-product-detail-quick-stat__value">{display.harvestDate}</p>
                </div>
                <div className="agrivo-product-detail-quick-stat">
                  <p className="agrivo-product-detail-quick-stat__label">
                    {t("productDetail.hero.deliveryAvailability")}
                  </p>
                  <p className="agrivo-product-detail-quick-stat__value">
                    {display.deliveryAvailableLabel}
                  </p>
                </div>
              </div>

              {cartCount > 0 ? (
                <p className="agrivo-product-detail-cart-note">
                  {formatCartSummary(t, cartCount)}
                </p>
              ) : null}

              <div className="agrivo-product-detail-delivery">
                <DeliveryMethodPicker
                  quotes={deliveryQuotes}
                  selected={selectedDeliveryMethod}
                  onSelect={setSelectedDeliveryMethod}
                  compact
                />
              </div>

              <div className="agrivo-product-detail-actions">
                <div className="agrivo-product-detail-actions__primary">
                  {isBuyer ? (
                    <>
                      <ProductAddToCartButton
                        slug={product.slug}
                        className="agrivo-product-detail-btn agrivo-product-detail-btn--primary"
                        label={t("productDetail.hero.addToCart")}
                      />
                      <Button
                        variant="outline"
                        className="agrivo-product-detail-btn agrivo-product-detail-btn--secondary"
                        onClick={() => navigate("dashboard/buyer/cart")}
                      >
                        {t("productDetail.hero.orderNow")}
                      </Button>
                    </>
                  ) : !isAuthenticated ? (
                    <Button
                      className="agrivo-product-detail-btn agrivo-product-detail-btn--primary"
                      onClick={() => navigate("login")}
                    >
                      {t("product.loginToOrder")}
                    </Button>
                  ) : isFarmer ? (
                    <Button
                      variant="outline"
                      className="agrivo-product-detail-btn agrivo-product-detail-btn--secondary"
                      onClick={() => navigate("dashboard/farmer")}
                    >
                      {t("productDetail.goToFarmerDashboard")}
                    </Button>
                  ) : null}
                </div>

                <div className="agrivo-product-detail-actions__secondary">
                  <Button
                    variant="outline"
                    className="agrivo-product-detail-btn agrivo-product-detail-btn--secondary"
                    onClick={handleContactSeller}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("productDetail.hero.contactSeller")}
                  </Button>

                  {product.farmerSlug ? (
                    <Button
                      variant="outline"
                      className="agrivo-product-detail-btn agrivo-product-detail-btn--secondary"
                      onClick={() => navigate(`farmers/${product.farmerSlug}`)}
                    >
                      {t("productDetail.hero.viewFarmerProfile")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="agrivo-product-detail-layout mt-6">
          <div className="agrivo-product-detail-main space-y-6">
            <section className="agrivo-dashboard-panel">
              <h2 className="agrivo-heading text-lg font-bold text-[#102018]">
                {t("productDetail.sections.productDetails")}
              </h2>
              {display.description ? (
                <p className="mt-3 text-sm leading-6 text-[#5F6F64]">{display.description}</p>
              ) : null}
              <dl className="agrivo-product-detail-fields mt-4">
                <DetailField label={t("productDetail.details.category")} value={display.category} />
                {display.variety ? (
                  <DetailField label={t("productDetail.details.varietySort")} value={display.variety} />
                ) : null}
                <DetailField label={t("productDetail.details.unit")} value={product.unit ?? "kg"} />
                <DetailField
                  label={t("productDetail.details.minimumOrder")}
                  value={product.minimumOrder ?? "20 kg"}
                />
                <DetailField
                  label={t("productDetail.details.availableQuantity")}
                  value={product.quantity}
                />
                <DetailField
                  label={t("productDetail.details.pricePerUnit")}
                  value={product.priceDisplay}
                />
                <DetailField
                  label={t("productDetail.details.harvestDate")}
                  value={display.harvestDate}
                />
                <DetailField
                  label={t("productDetail.details.freshness")}
                  value={display.freshnessStatus}
                />
                <DetailField label={t("productDetail.details.batchId")} value={product.batchId} />
                <DetailField
                  label={t("productDetail.details.storageNote")}
                  value={display.storageNote}
                />
                <DetailField
                  label={t("productDetail.details.delivery")}
                  value={
                    product.deliveryAvailable
                      ? t("productDetail.details.available")
                      : t("product.pickupOnly")
                  }
                />
              </dl>
            </section>

            <section className="agrivo-dashboard-panel">
              <h2 className="agrivo-heading text-lg font-bold text-[#102018]">
                {t("productDetail.sections.productOrigin")}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#14532D]">
                <MapPin className="h-4 w-4 shrink-0" />
                {product.economicRegion} → {districtShortName(product.district)}
                {product.village ? ` → ${product.village}` : ""}
              </p>
              <div className="mt-4">
                <ProductOriginPreview product={product} />
              </div>
            </section>

            <section className="agrivo-dashboard-panel">
              <h2 className="agrivo-heading text-lg font-bold text-[#102018]">
                {t("productDetail.sections.deliveryInformation")}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5F6F64]">{t("productDetail.delivery.deliveryAvailable")}</dt>
                  <dd className="font-semibold text-[#102018]">{display.deliveryYesNo}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5F6F64]">{t("productDetail.delivery.estimatedDelivery")}</dt>
                  <dd className="font-semibold text-[#102018]">
                    {deliveryQuotes.find((q) => q.method === selectedDeliveryMethod)?.estimatedTimeLabel ??
                      display.estimatedDelivery}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5F6F64]">{t("productDetail.delivery.logisticsSupport")}</dt>
                  <dd className="font-semibold text-[#102018]">{display.logisticsSupport}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[#5F6F64]">{t("productDetail.delivery.pickupFromFarm")}</dt>
                  <dd className="font-semibold text-[#102018]">{display.pickupAvailableLabel}</dd>
                </div>
                {selectedDeliveryMethod === "self_pickup" ? (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[#5F6F64]">{t("delivery.pickupHours", "Pickup Hours")}</dt>
                      <dd className="font-semibold text-[#102018]">
                        {deliveryQuotes.find((q) => q.method === "self_pickup")?.meta?.hoursLabel}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[#5F6F64]">{t("delivery.pickupReadyIn", "Pickup ready in")}</dt>
                      <dd className="font-semibold text-[#102018]">
                        {deliveryQuotes.find((q) => q.method === "self_pickup")?.meta?.prepMinutes}{" "}
                        {t("delivery.minutes", "min")}
                      </dd>
                    </div>
                  </>
                ) : null}
                {selectedDeliveryMethod === "farmer_delivery" ? (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[#5F6F64]">{t("delivery.radius", "Radius")}</dt>
                    <dd className="font-semibold text-[#102018]">
                      {deliveryQuotes.find((q) => q.method === "farmer_delivery")?.meta?.radiusKm} km
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </div>

          <aside className="agrivo-product-detail-sidebar">
            <section className="agrivo-dashboard-panel agrivo-product-detail-sidebar-card">
              <div className="flex items-start gap-3">
                {product.farmerProfile?.image ? (
                  <ImageWithFallback
                    src={product.farmerProfile.image}
                    alt={product.farmer}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] text-lg font-bold text-[#14532D]">
                    {product.farmer.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="agrivo-heading text-base font-bold text-[#102018]">{product.farmer}</h3>
                  {product.farmerVerified ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#166534]">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {t("productDetail.farmerCard.verifiedFarmer")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#5F6F64]">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                  {product.farmerProfile?.village
                    ? `${product.farmerProfile.location}, ${product.farmerProfile.village}`
                    : product.locationPath.split(">").slice(-2).join(",").trim()}
                </p>
                <p className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  {t("productDetail.farmerCard.rating")}: {product.farmerRating}
                </p>
                <p>
                  {t("productDetail.farmerCard.completedOrders")}: {product.farmerCompletedOrders}
                </p>
                <p>
                  <span className="font-medium text-[#102018]">
                    {t("productDetail.farmerCard.specializesIn")}:
                  </span>{" "}
                  {display.farmerSpecialization}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {product.farmerSlug ? (
                  <Button
                    className="w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                    onClick={() => navigate(`farmers/${product.farmerSlug}`)}
                  >
                    {t("productDetail.farmerCard.viewFarmerProfile")}
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={handleContactSeller}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("productDetail.farmerCard.contactWhatsapp")}
                </Button>
              </div>
            </section>

            <section className="agrivo-dashboard-panel agrivo-product-detail-logistics-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] border border-[#bbf7d0]">
                  <Truck className="h-4 w-4 text-[#14532D]" />
                </div>
                <h3 className="agrivo-heading text-sm font-bold text-[#14532D]">
                  {t("productDetail.logisticsCard.title")}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5F6F64]">
                {t("productDetail.logisticsCard.description")}
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#edf2ea] bg-[#f8faf4] px-3 py-2 text-xs font-medium text-[#3f5247]">
                <Navigation className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                {formatLogisticsHandoff(t, display.estimatedDelivery)}
              </div>
            </section>
          </aside>
        </div>

        <SimilarProducts products={similarProducts} />
      </div>
    </div>
  );
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const { t } = useLanguage();
  const [listing, setListing] = useState<HarvestListing | null>(null);
  const [similarListings, setSimilarListings] = useState<HarvestListing[] | null>(null);
  const [isLoading, setIsLoading] = useState(isApiMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiMode) {
      const mockListing = getProductBySlug(slug);
      setListing(mockListing ?? null);
      setSimilarListings(mockListing ? getSimilarProducts(mockListing) : []);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    const cleanId = slug.startsWith("api-") ? slug.replace(/^api-/, "") : slug;
    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([getProductById(cleanId), getProducts()])
      .then(([product, allProducts]) => {
        if (!active) return;
        const mapped = mapApiProductToHarvestListing(product);
        const mappedAll = allProducts.map(mapApiProductToHarvestListing);
        setListing(mapped);
        setSimilarListings(getSimilarProductsFromList(mapped, mappedAll));
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(t("product.loadError"));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug, t]);

  if (isLoading) return <ProductLoading />;
  if (errorMessage) return <ProductLoadError message={errorMessage} />;
  if (!listing) return <ProductNotFound />;

  const product = buildMarketplaceProductDetail(listing);
  return <ProductDetailContent product={product} similarProducts={similarListings ?? []} />;
}

function mapApiProductToHarvestListing(product: ApiProduct): HarvestListing {
  const category = product.category || "Produce";
  const productType = category.toLowerCase().includes("fruit")
    ? "Fruits"
    : category.toLowerCase().includes("vegetable")
      ? "Vegetables"
      : category;

  return {
    id: product.id,
    slug: product.id,
    name: product.name,
    productType,
    economicRegion: (product.region || "Bakı") as HarvestListing["economicRegion"],
    district: product.district || "Baku",
    village: product.village || "",
    farmer: product.farmer?.name || "Farmer",
    farmerSlug: product.farmer?.id || null,
    farmerVerified: true,
    quantity: `${product.quantity} ${product.unit}`,
    pricePerKg: `${product.price} AZN/${product.unit}`,
    harvestDate: product.harvestDate || "This week",
    tags: [
      product.variety ? `Variety: ${product.variety}` : "Fresh",
      product.isOrganic ? "Organic" : "Verified farmer",
      product.availableNow ? "Available now" : "Pre-order",
    ],
    image: product.imageUrl || "",
    deliveryAvailable: true,
    description: product.description || undefined,
    unit: product.unit,
    minimumOrder: `1 ${product.unit}`,
    category: product.category,
    variety: product.variety || undefined,
  };
}

function getSimilarProductsFromList(
  listing: HarvestListing,
  source: HarvestListing[],
  limit = 4,
): HarvestListing[] {
  const scored = source
    .filter((item) => item.id !== listing.id)
    .map((item) => {
      let score = 0;
      if (item.productType === listing.productType) score += 3;
      if (item.economicRegion === listing.economicRegion) score += 2;
      if (item.category === listing.category) score += 1;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ item }) => item);
}
