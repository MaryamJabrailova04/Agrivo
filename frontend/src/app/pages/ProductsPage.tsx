import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Filter, Map, Search, SlidersHorizontal, Sprout, Truck, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  formatAllListingsIn,
  formatAvailableIn,
  formatInsightHighlight,
  formatListingCount,
  formatMoreListings,
  formatQuickStatsSubtitle,
  formatShowingCount,
  formatViewAllDistrictsIn,
  translateProductChip,
  translateRegionSummary,
  translateTopProductsList,
} from "../../i18n/marketplaceHelpers";
import { HarvestListingCard } from "../components/harvest/HarvestListingCard";
import { HarvestMap } from "../components/harvest/HarvestMap";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { EconomicRegion } from "../data/azerbaijanRegions";
import { economicRegions, getDistrictsForRegion } from "../data/azerbaijanRegions";
import {
  PRODUCT_CHIPS,
  getDistrictRecords,
  getProductDetailHash,
  getRegionInsight,
  harvestListings,
  matchesProductChip,
  type HarvestListing,
} from "../data/harvestExplorer";
import { getFarmerBySlug } from "../data/farmers";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { getProductDeliveryCapability } from "../utils/deliveryOptionsStorage";
import {
  getFarmerDeliverySettings,
  isFastDelivery,
  isFreeDelivery,
} from "../utils/farmerDeliverySettingsStorage";
import { districtShortName, districtsMatchGeo } from "../data/harvestExplorerUtils";
import { isApiMode } from "../../config/dataMode";
import { getProducts, type ApiProduct } from "../../api/productsApi";

const PREVIEW_COUNT = 4;
const REMAINING_PAGE_SIZE = 12;
const MOBILE_PAGE_SIZE = 8;
const filterControlClass =
  "agrivo-marketplace-control h-11 w-full rounded-full border-[#D8E8D4] bg-[#F8FBF6] text-sm shadow-none transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-[#43A047] focus-visible:ring-[3px] focus-visible:ring-[#43A047]/15";

function parseInsightHighlight(item: string): { count: number; productType: string } | null {
  const match = item.match(/^(\d+)\s+(\w+)\s+listings$/i);
  if (!match) return null;
  const productType = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return { count: Number(match[1]), productType };
}

function HarvestListingSkeleton() {
  return (
    <div className="agrivo-harvest-skeleton agrivo-product-card max-w-[340px] min-h-[540px] w-full overflow-hidden rounded-[30px] border border-[#e5efe1] bg-white p-3">
      <div className="agrivo-harvest-skeleton-block h-[232px] rounded-[22px]" />
      <div className="mt-4 space-y-3 px-2">
        <div className="agrivo-harvest-skeleton-block h-3 w-2/3 rounded-full" />
        <div className="agrivo-harvest-skeleton-block h-5 w-4/5 rounded-full" />
        <div className="agrivo-harvest-skeleton-block h-4 w-1/2 rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-2.5 pt-4">
          <div className="agrivo-harvest-skeleton-block h-11 rounded-full" />
          <div className="agrivo-harvest-skeleton-block h-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function sortListingsWithSelectedFirst(listings: HarvestListing[], selectedId: string | null) {
  if (!selectedId) return listings;
  const selected = listings.find((listing) => listing.id === selectedId);
  if (!selected) return listings;
  return [selected, ...listings.filter((listing) => listing.id !== selectedId)];
}

function mapCategoryToProductType(category: string): string {
  if (category.toLowerCase().includes("fruit")) return "Fruits";
  if (category.toLowerCase().includes("vegetable")) return "Vegetables";
  return category;
}

function mapApiProductToHarvestListing(product: ApiProduct): HarvestListing {
  const productType = mapCategoryToProductType(product.category);
  return {
    id: product.id,
    slug: product.id,
    name: product.name,
    productType,
    economicRegion: (product.region || "Bakı") as EconomicRegion,
    district: product.district || "Baku",
    village: product.village || "",
    farmer: product.farmer?.name || "Farmer",
    farmerSlug: null,
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

function HarvestListingGrid({
  listings,
  compact = false,
  selectedListingId = null,
  className = "agrivo-harvest-results-grid",
}: {
  listings: HarvestListing[];
  compact?: boolean;
  selectedListingId?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      {listings.map((listing) => (
        <div key={listing.id} className="agrivo-harvest-grid-item h-full">
          <HarvestListingCard
            listing={listing}
            compact={compact}
            selected={selectedListingId === listing.id}
            onViewDetails={() => {
              navigateToHash(getProductDetailHash(listing.slug));
            }}
            onContactSeller={() => {
              if (listing.farmerSlug) {
                const farmer = getFarmerBySlug(listing.farmerSlug);
                if (farmer) {
                  window.open(buildWhatsAppUrl(farmer.whatsapp, farmer.name), "_blank", "noopener,noreferrer");
                  return;
                }
              }
              navigateToHash("login");
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useLanguage();

  const heroStats = useMemo(
    () => [
      t("marketplace.snapshot.activeListings"),
      t("marketplace.snapshot.verifiedFarmers"),
      t("marketplace.snapshot.economicRegions"),
      t("marketplace.snapshot.updatedDaily"),
    ],
    [t],
  );

  const [apiListings, setApiListings] = useState<HarvestListing[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productChip, setProductChip] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState<EconomicRegion | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [villageFilter, setVillageFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [filterFarmerDelivery, setFilterFarmerDelivery] = useState(false);
  const [filterLogistics, setFilterLogistics] = useState(false);
  const [filterPickup, setFilterPickup] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [visibleCount, setVisibleCount] = useState(REMAINING_PAGE_SIZE);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(MOBILE_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [panelHoveredDistrict, setPanelHoveredDistrict] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const sourceListings = isApiMode ? apiListings : harvestListings;

  const districtOptions = useMemo(
    () => (regionFilter === "all" ? [] : getDistrictsForRegion(regionFilter)),
    [regionFilter],
  );

  const regionStats = useMemo(() => {
    const stats: Partial<
      Record<
        EconomicRegion,
        { listingCount: number; farmerCount: number; topProducts: string[] }
      >
    > = {};
    for (const region of economicRegions) {
      const insight = getRegionInsight(region, sourceListings);
      stats[region] = {
        listingCount: insight.listingCount,
        farmerCount: insight.farmerCount,
        topProducts: insight.topProducts,
      };
    }
    return stats;
  }, [sourceListings]);

  const filteredListings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sourceListings.filter((listing) => {
      const matchesQuery =
        !query ||
        listing.name.toLowerCase().includes(query) ||
        (listing.variety?.toLowerCase().includes(query) ?? false) ||
        listing.productType.toLowerCase().includes(query) ||
        listing.farmer.toLowerCase().includes(query) ||
        listing.district.toLowerCase().includes(query) ||
        listing.economicRegion.toLowerCase().includes(query);

      const matchesChip = matchesProductChip(listing, productChip);
      const matchesCategory =
        categoryFilter === "all" ||
        listing.productType.toLowerCase() === categoryFilter.toLowerCase() ||
        (categoryFilter === "Fruits" &&
          ["Apple", "Pomegranate", "Grapes", "Citrus", "Fruits", "Pear", "Cherry", "Melon"].includes(
            listing.productType,
          )) ||
        (categoryFilter === "Vegetables" &&
          ["Tomato", "Potato", "Cucumber", "Vegetables", "Onion", "Pepper", "Eggplant", "Greenhouse"].includes(
            listing.productType,
          ));

      const matchesRegion = regionFilter === "all" || listing.economicRegion === regionFilter;
      const matchesDistrict =
        districtFilter === "all" ||
        listing.district === districtFilter ||
        districtShortName(listing.district) === districtShortName(districtFilter) ||
        districtsMatchGeo(districtFilter, listing.district);

      const matchesVillage =
        !villageFilter.trim() || listing.village.toLowerCase().includes(villageFilter.toLowerCase());

      const matchesVerified = !verifiedOnly || listing.farmerVerified;
      const matchesDelivery = !deliveryOnly || listing.deliveryAvailable;
      const capability = getProductDeliveryCapability(
        listing.id,
        listing.slug,
        listing.farmerSlug,
        listing.deliveryAvailable,
      );
      const settings = getFarmerDeliverySettings(listing.farmerSlug);
      const matchesFarmerDelivery = !filterFarmerDelivery || capability.farmerDelivery;
      const matchesLogistics = !filterLogistics || capability.agrivoLogistics;
      const matchesPickup = !filterPickup || capability.selfPickup;
      const matchesFree = !filterFreeDelivery || isFreeDelivery(settings);
      const matchesFast = !filterFastDelivery || isFastDelivery(settings);

      return (
        matchesQuery &&
        matchesChip &&
        matchesCategory &&
        matchesRegion &&
        matchesDistrict &&
        matchesVillage &&
        matchesVerified &&
        matchesDelivery &&
        matchesFarmerDelivery &&
        matchesLogistics &&
        matchesPickup &&
        matchesFree &&
        matchesFast
      );
    });
  }, [
    categoryFilter,
    deliveryOnly,
    districtFilter,
    filterFarmerDelivery,
    filterFastDelivery,
    filterFreeDelivery,
    filterLogistics,
    filterPickup,
    productChip,
    regionFilter,
    searchTerm,
    verifiedOnly,
    villageFilter,
    sourceListings,
  ]);

  const sortedFilteredListings = useMemo(
    () => sortListingsWithSelectedFirst(filteredListings, selectedProductId),
    [filteredListings, selectedProductId],
  );

  const previewListings = sortedFilteredListings.slice(0, PREVIEW_COUNT);
  const remainingListings = sortedFilteredListings.slice(PREVIEW_COUNT);
  const visibleRemaining = remainingListings.slice(0, visibleCount);
  const hasMoreRemaining = visibleCount < remainingListings.length;
  const mobileListings = sortedFilteredListings.slice(0, mobileVisibleCount);
  const hasMoreMobile = mobileVisibleCount < sortedFilteredListings.length;

  const quickStats = useMemo(() => {
    const farmers = new Set(filteredListings.map((listing) => listing.farmer)).size;
    const deliveryCount = filteredListings.filter((listing) => listing.deliveryAvailable).length;
    return {
      listings: filteredListings.length,
      farmers,
      deliveryCount,
    };
  }, [filteredListings]);

  const regionScopedListings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sourceListings.filter((listing) => {
      if (regionFilter !== "all" && listing.economicRegion !== regionFilter) return false;

      const matchesQuery =
        !query ||
        listing.name.toLowerCase().includes(query) ||
        (listing.variety?.toLowerCase().includes(query) ?? false) ||
        listing.productType.toLowerCase().includes(query) ||
        listing.farmer.toLowerCase().includes(query) ||
        listing.district.toLowerCase().includes(query) ||
        listing.economicRegion.toLowerCase().includes(query);

      const matchesChip = matchesProductChip(listing, productChip);
      const matchesCategory =
        categoryFilter === "all" ||
        listing.productType.toLowerCase() === categoryFilter.toLowerCase() ||
        (categoryFilter === "Fruits" &&
          ["Apple", "Pomegranate", "Grapes", "Citrus", "Fruits", "Pear", "Cherry", "Melon"].includes(
            listing.productType,
          )) ||
        (categoryFilter === "Vegetables" &&
          ["Tomato", "Potato", "Cucumber", "Vegetables", "Onion", "Pepper", "Eggplant", "Greenhouse"].includes(
            listing.productType,
          ));

      const matchesVillage =
        !villageFilter.trim() || listing.village.toLowerCase().includes(villageFilter.toLowerCase());

      const matchesVerified = !verifiedOnly || listing.farmerVerified;
      const matchesDelivery = !deliveryOnly || listing.deliveryAvailable;
      const capability = getProductDeliveryCapability(
        listing.id,
        listing.slug,
        listing.farmerSlug,
        listing.deliveryAvailable,
      );
      const settings = getFarmerDeliverySettings(listing.farmerSlug);
      const matchesFarmerDelivery = !filterFarmerDelivery || capability.farmerDelivery;
      const matchesLogistics = !filterLogistics || capability.agrivoLogistics;
      const matchesPickup = !filterPickup || capability.selfPickup;
      const matchesFree = !filterFreeDelivery || isFreeDelivery(settings);
      const matchesFast = !filterFastDelivery || isFastDelivery(settings);

      return (
        matchesQuery &&
        matchesChip &&
        matchesCategory &&
        matchesVillage &&
        matchesVerified &&
        matchesDelivery &&
        matchesFarmerDelivery &&
        matchesLogistics &&
        matchesPickup &&
        matchesFree &&
        matchesFast
      );
    });
  }, [
    categoryFilter,
    deliveryOnly,
    filterFarmerDelivery,
    filterFastDelivery,
    filterFreeDelivery,
    filterLogistics,
    filterPickup,
    productChip,
    regionFilter,
    searchTerm,
    verifiedOnly,
    villageFilter,
    sourceListings,
  ]);

  const availableDistricts = useMemo(() => {
    if (regionFilter === "all") return [];

    const grouped = regionScopedListings.reduce<
      Record<
        string,
        {
          districtFull: string;
          shortName: string;
          count: number;
          productCounts: Record<string, number>;
        }
      >
    >((acc, listing) => {
      const key = listing.district;
      if (!acc[key]) {
        acc[key] = {
          districtFull: listing.district,
          shortName: districtShortName(listing.district),
          count: 0,
          productCounts: {},
        };
      }
      acc[key].count += 1;
      acc[key].productCounts[listing.productType] = (acc[key].productCounts[listing.productType] ?? 0) + 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((entry) => {
        const topProducts = Object.entries(entry.productCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([product]) => product);
        return {
          ...entry,
          topProducts,
        };
      })
      .sort((a, b) => b.count - a.count || a.shortName.localeCompare(b.shortName));
  }, [regionFilter, regionScopedListings]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setProductChip(null);
    setCategoryFilter("all");
    setRegionFilter("all");
    setDistrictFilter("all");
    setVillageFilter("");
    setVerifiedOnly(false);
    setDeliveryOnly(false);
    setVisibleCount(REMAINING_PAGE_SIZE);
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
    setSelectedProductId(null);
    setPanelHoveredDistrict(null);
  };

  const resetVisibleCount = () => {
    setVisibleCount(REMAINING_PAGE_SIZE);
    setMobileVisibleCount(MOBILE_PAGE_SIZE);
  };

  const selectedInsight =
    regionFilter !== "all" ? getRegionInsight(regionFilter, filteredListings) : null;

  const districtRecords =
    regionFilter !== "all" ? getDistrictRecords(regionFilter) : [];

  useEffect(() => {
    if (!isApiMode) return;

    let mounted = true;
    setIsFetchingProducts(true);
    setApiError(null);

    getProducts()
      .then((products) => {
        if (!mounted) return;
        const mapped = products.map(mapApiProductToHarvestListing);
        if (import.meta.env.DEV) {
          console.info("[Products] API fetch success:", mapped.length);
        }
        setApiListings(mapped);
      })
      .catch((error) => {
        if (!mounted) return;
        if (import.meta.env.DEV) {
          console.error("[Products] API fetch failed:", error);
        }
        setApiError(error instanceof Error ? error.message : t("marketplace.unableToLoad"));
      })
      .finally(() => {
        if (mounted) {
          setIsFetchingProducts(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  useEffect(() => {
    setPanelHoveredDistrict(null);
    setSelectedProductId(null);
  }, [regionFilter]);

  useEffect(() => {
    setSelectedProductId(null);
  }, [districtFilter]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, [
    searchTerm,
    productChip,
    categoryFilter,
    regionFilter,
    districtFilter,
    villageFilter,
    verifiedOnly,
    deliveryOnly,
  ]);

  const handleRegionSelect = (region: EconomicRegion | "all") => {
    setRegionFilter(region);
    setDistrictFilter("all");
    setSelectedProductId(null);
    setPanelHoveredDistrict(null);
    resetVisibleCount();
  };

  const handleDistrictSelect = (district: string | "all") => {
    if (district === "all") {
      setDistrictFilter("all");
      setPanelHoveredDistrict(null);
      setSelectedProductId(null);
      return;
    }
    const record = districtRecords.find((entry) => districtsMatchGeo(district, entry.district));
    setDistrictFilter(record?.district ?? district);
    setSelectedProductId(null);
    resetVisibleCount();
  };

  const handleProductSelect = useCallback((listing: HarvestListing | null) => {
    setSelectedProductId(listing?.id ?? null);
  }, []);

  const handleMapDistrictHover = (geoDistrict: string | null) => {
    if (!geoDistrict || regionFilter === "all") {
      setPanelHoveredDistrict(null);
      return;
    }
    const record = districtRecords.find((entry) => districtsMatchGeo(geoDistrict, entry.district));
    setPanelHoveredDistrict(record?.district ?? geoDistrict);
  };

  const selectionLabel =
    districtFilter !== "all"
      ? `${regionFilter} · ${districtShortName(districtFilter)}`
      : regionFilter !== "all"
        ? regionFilter
        : t("marketplace.allAzerbaijan");

  const resultsTitle =
    regionFilter === "all"
      ? t("marketplace.listings.nearbyTitle")
      : districtFilter !== "all"
        ? formatAvailableIn(t, districtShortName(districtFilter))
        : formatAvailableIn(t, regionFilter);

  const resultsSubtitle =
    regionFilter === "all"
      ? t("marketplace.listings.nearbySubtitle")
      : formatQuickStatsSubtitle(
          t,
          quickStats.listings,
          quickStats.farmers,
          quickStats.deliveryCount,
        );

  const allListingsTitle =
    regionFilter === "all"
      ? t("marketplace.listings.allTitle")
      : districtFilter !== "all"
        ? formatAllListingsIn(t, districtShortName(districtFilter))
        : formatAllListingsIn(t, regionFilter);

  return (
    <div className="agrivo-shell agrivo-harvest-explorer min-h-screen">
      <AgrivoNavbar activeItem="marketplace" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <div className="agrivo-container py-8 sm:py-10 lg:py-12">
        <section className="agrivo-harvest-hero">
          <div className="agrivo-harvest-hero-copy">
            <p className="agrivo-marketplace-eyebrow">{t("nav.marketplace")}</p>
            <h1 className="agrivo-heading agrivo-harvest-hero-title">
              {t("marketplace.title")}
            </h1>
            <p className="agrivo-harvest-hero-subtitle">
              {t("marketplace.subtitle")}
            </p>

            <div className="agrivo-harvest-hero-search">
              <Search className="agrivo-harvest-hero-search-icon" strokeWidth={2} />
              <Input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(REMAINING_PAGE_SIZE);
                  setMobileVisibleCount(MOBILE_PAGE_SIZE);
                }}
                placeholder={t("marketplace.searchPlaceholder")}
                className={filterControlClass}
              />
            </div>

            <div className="agrivo-harvest-chips">
              {PRODUCT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setProductChip(productChip === chip ? null : chip);
                    setCategoryFilter("all");
                    setVisibleCount(REMAINING_PAGE_SIZE);
                    setMobileVisibleCount(MOBILE_PAGE_SIZE);
                  }}
                  className={`agrivo-harvest-chip ${productChip === chip ? "agrivo-harvest-chip--active" : ""}`}
                >
                  {translateProductChip(t, chip)}
                </button>
              ))}
            </div>
          </div>

          <div className="agrivo-harvest-stats-card">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#15803d]">
              {t("marketplace.snapshot.eyebrow")}
            </p>
            <p className="mt-2 text-lg font-bold text-[#102018]">{t("marketplace.snapshot.title")}</p>
            <ul className="mt-4 space-y-3">
              {heroStats.map((stat) => (
                <li key={stat} className="flex items-center gap-2 text-sm text-[#3f5247]">
                  <span className="h-2 w-2 rounded-full bg-[#43A047]" />
                  {stat}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="agrivo-harvest-filters" aria-label={t("marketplace.filterTitle")}>
          <div className="agrivo-harvest-filters-head">
            <div className="flex items-center gap-2 text-[#14532D]">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-semibold">{t("marketplace.filterTitle")}</span>
            </div>
            <Button
              variant="ghost"
              className="hidden rounded-full text-sm text-[#14532D] hover:bg-[#EAF7EC] md:inline-flex"
              onClick={() => setShowMoreFilters((value) => !value)}
            >
              {showMoreFilters ? t("marketplace.lessFilters") : t("marketplace.moreFilters")}
              <ChevronDown className={`ml-1 h-4 w-4 transition ${showMoreFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          <div className="agrivo-harvest-filters-grid">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className={filterControlClass}>
                <SelectValue placeholder={t("marketplace.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("marketplace.filters.allCategories")}</SelectItem>
                <SelectItem value="Fruits">{t("marketplace.categories.fruits")}</SelectItem>
                <SelectItem value="Vegetables">{t("marketplace.categories.vegetables")}</SelectItem>
                {PRODUCT_CHIPS.map((chip) => (
                  <SelectItem key={chip} value={chip}>
                    {translateProductChip(t, chip)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={regionFilter}
              onValueChange={(value) => handleRegionSelect(value as EconomicRegion | "all")}
            >
              <SelectTrigger className={filterControlClass}>
                <SelectValue placeholder={t("marketplace.economicRegion")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("marketplace.filters.allRegions")}</SelectItem>
                {economicRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={districtFilter}
              onValueChange={handleDistrictSelect}
              disabled={regionFilter === "all"}
            >
              <SelectTrigger className={filterControlClass} disabled={regionFilter === "all"}>
                <SelectValue placeholder={t("marketplace.district")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("marketplace.filters.allDistricts")}</SelectItem>
                {districtOptions.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="agrivo-harvest-more-filters-btn md:hidden"
              onClick={() => setShowMobileFilters((value) => !value)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t("marketplace.mobileFilters")}
            </Button>
          </div>

          <AnimatePresence>
            {(showMoreFilters || showMobileFilters) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="agrivo-harvest-more-filters overflow-hidden"
              >
                <div className="grid gap-3 pt-4 md:grid-cols-3">
                  <Input
                    placeholder={t("marketplace.village")}
                    value={villageFilter}
                    onChange={(e) => setVillageFilter(e.target.value)}
                    className={filterControlClass}
                  />
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(Boolean(v))} />
                    {t("marketplace.verifiedOnly")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox checked={deliveryOnly} onCheckedChange={(v) => setDeliveryOnly(Boolean(v))} />
                    {t("marketplace.deliveryOnly")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filterFarmerDelivery}
                      onCheckedChange={(v) => setFilterFarmerDelivery(Boolean(v))}
                    />
                    {t("delivery.filters.farmer")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox checked={filterLogistics} onCheckedChange={(v) => setFilterLogistics(Boolean(v))} />
                    {t("delivery.filters.logistics")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox checked={filterPickup} onCheckedChange={(v) => setFilterPickup(Boolean(v))} />
                    {t("delivery.filters.pickup")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filterFreeDelivery}
                      onCheckedChange={(v) => setFilterFreeDelivery(Boolean(v))}
                    />
                    {t("delivery.filters.free")}
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#e3ece0] bg-[#f8fbf6] px-4 py-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filterFastDelivery}
                      onCheckedChange={(v) => setFilterFastDelivery(Boolean(v))}
                    />
                    {t("delivery.filters.fast")}
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="agrivo-harvest-explorer-layout">
          <div className="agrivo-harvest-explorer-top">
            <aside
              className={`agrivo-harvest-explorer-pane ${showMobileMap ? "agrivo-harvest-explorer-pane--open" : ""}`}
            >
              <HarvestMap
                selectedRegion={regionFilter}
                selectedDistrict={districtFilter}
                selectedProductId={selectedProductId}
                productChip={productChip}
                listings={sourceListings}
                regionStats={regionStats}
                onRegionSelect={handleRegionSelect}
                onDistrictSelect={handleDistrictSelect}
                onProductSelect={handleProductSelect}
                panelHoveredDistrict={panelHoveredDistrict}
                onDistrictHover={handleMapDistrictHover}
              />

              <div className="agrivo-harvest-selection-card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15803d]">
                  {t("marketplace.map.currentSelection")}
                </p>
                <p className="mt-2 text-base font-bold text-[#102018]">{selectionLabel}</p>
                <div className="agrivo-harvest-quick-stats mt-3">
                  <div className="agrivo-harvest-quick-stat">
                    <Sprout className="h-4 w-4 text-[#43A047]" />
                    <span>
                      <strong>{quickStats.listings}</strong> {t("marketplace.map.listings")}
                    </span>
                  </div>
                  <div className="agrivo-harvest-quick-stat">
                    <Users className="h-4 w-4 text-[#43A047]" />
                    <span>
                      <strong>{quickStats.farmers}</strong> {t("marketplace.map.farmers")}
                    </span>
                  </div>
                  <div className="agrivo-harvest-quick-stat">
                    <Truck className="h-4 w-4 text-[#43A047]" />
                    <span>
                      <strong>{quickStats.deliveryCount}</strong> {t("marketplace.map.delivery")}
                    </span>
                  </div>
                </div>
                {(regionFilter !== "all" || districtFilter !== "all" || productChip) && (
                  <Button
                    variant="outline"
                    className="agrivo-harvest-reset-btn mt-4 w-full"
                    onClick={clearAllFilters}
                  >
                    {t("marketplace.resetSelection")}
                  </Button>
                )}
              </div>

              {selectedInsight && regionFilter !== "all" ? (
                <div className="agrivo-harvest-insight-card">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15803d]">
                    {t("marketplace.insight.eyebrow")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3f5247]">
                    {translateRegionSummary(t, regionFilter, selectedInsight.summary)}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#5F6F64]">
                    {t("marketplace.insight.topProducts")}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {selectedInsight.highlights.map((item) => {
                      const parsed = parseInsightHighlight(item);
                      const label = parsed
                        ? formatInsightHighlight(t, parsed.count, parsed.productType)
                        : item;
                      return (
                        <li key={item} className="text-sm text-[#102018]">
                          • {label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {availableDistricts.length > 0 ? (
                <div className="agrivo-harvest-district-panel">
                  <div className="agrivo-harvest-district-panel-head">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15803d]">
                      {t("marketplace.districts.eyebrow")}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#5F6F64]">
                      {t("marketplace.districts.subtitle")}
                    </p>
                  </div>

                  {districtFilter !== "all" ? (
                    <button
                      type="button"
                      className="agrivo-harvest-district-clear"
                      onClick={() => handleDistrictSelect("all")}
                    >
                      {formatViewAllDistrictsIn(t, regionFilter)}
                    </button>
                  ) : null}

                  <ul className="agrivo-harvest-district-list">
                    {availableDistricts.map((item) => {
                      const isSelected =
                        districtFilter !== "all" && districtsMatchGeo(item.districtFull, districtFilter);
                      const isHovered =
                        panelHoveredDistrict !== null &&
                        districtsMatchGeo(item.districtFull, panelHoveredDistrict);

                      return (
                        <li key={item.districtFull}>
                          <button
                            type="button"
                            className={`agrivo-harvest-district-row ${isSelected ? "agrivo-harvest-district-row--selected" : ""} ${isHovered && !isSelected ? "agrivo-harvest-district-row--hovered" : ""}`}
                            onClick={() => handleDistrictSelect(item.districtFull)}
                            onMouseEnter={() => setPanelHoveredDistrict(item.districtFull)}
                            onMouseLeave={() => setPanelHoveredDistrict(null)}
                            onFocus={() => setPanelHoveredDistrict(item.districtFull)}
                            onBlur={() => setPanelHoveredDistrict(null)}
                          >
                            <span className="agrivo-harvest-district-row-main">
                              <span className="agrivo-harvest-district-name">{item.shortName}</span>
                              <span className="agrivo-harvest-district-meta">
                                {formatListingCount(t, item.count)}
                                {item.topProducts.length > 0
                                  ? ` · ${translateTopProductsList(t, item.topProducts)}`
                                  : ""}
                              </span>
                            </span>
                            <ChevronRight className="agrivo-harvest-district-arrow h-4 w-4 shrink-0" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </aside>

            <div className="agrivo-harvest-preview">
              <div className="agrivo-harvest-results-head">
                <div>
                  <h2 className="text-xl font-bold text-[#102018] sm:text-2xl">{resultsTitle}</h2>
                  <p className="mt-1 text-sm text-[#5F6F64]">{resultsSubtitle}</p>
                </div>
              </div>

              {apiError ? (
                <div className="agrivo-marketplace-empty">
                  <h3 className="text-xl font-semibold text-[#102018]">{t("marketplace.unableToLoad")}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                    {apiError}
                  </p>
                </div>
              ) : isLoading || isFetchingProducts ? (
                <div className="agrivo-harvest-preview-grid">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <HarvestListingSkeleton key={index} />
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <>
                  <HarvestListingGrid
                    listings={previewListings}
                    compact
                    selectedListingId={selectedProductId}
                    className="agrivo-harvest-preview-grid"
                  />
                </>
              ) : (
                <div className="agrivo-marketplace-empty">
                  <h3 className="text-xl font-semibold text-[#102018]">{t("marketplace.noProducts")}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                    {t("marketplace.noProductsDesc")}
                  </p>
                  <Button variant="outline" className="agrivo-marketplace-load-more-btn mt-6" onClick={clearAllFilters}>
                    {t("marketplace.clearFilters")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="agrivo-harvest-mobile-listings lg:hidden">
            {apiError ? (
              <div className="agrivo-marketplace-empty">
                <h3 className="text-xl font-semibold text-[#102018]">Unable to load products</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#5F6F64]">
                  {apiError}
                </p>
              </div>
            ) : isLoading || isFetchingProducts ? (
              <div className="agrivo-harvest-all-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <HarvestListingSkeleton key={index} />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="agrivo-harvest-all-listings-head">
                  <h2 className="text-xl font-bold text-[#102018]">{allListingsTitle}</h2>
                  <p className="mt-1 text-sm text-[#5F6F64]">
                    {formatShowingCount(t, mobileListings.length, filteredListings.length)}
                  </p>
                </div>
                <HarvestListingGrid
                  listings={mobileListings}
                  selectedListingId={selectedProductId}
                  className="agrivo-harvest-all-grid"
                />
                {hasMoreMobile ? (
                  <div className="agrivo-marketplace-load-more">
                    <Button
                      variant="outline"
                      className="agrivo-marketplace-load-more-btn"
                      onClick={() => setMobileVisibleCount((count) => count + MOBILE_PAGE_SIZE)}
                    >
                      {t("marketplace.loadMore")}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {remainingListings.length > 0 ? (
            <section id="harvest-all-listings" className="agrivo-harvest-all-listings agrivo-scroll-anchor hidden lg:block">
              <div className="agrivo-harvest-all-listings-head">
                <div>
                  <h2 className="text-xl font-bold text-[#102018] sm:text-2xl">{allListingsTitle}</h2>
                  <p className="mt-1 text-sm text-[#5F6F64]">
                    {formatMoreListings(t, remainingListings.length)}
                  </p>
                </div>
                <p className="agrivo-harvest-all-listings-count text-sm text-[#5F6F64]">
                  {formatShowingCount(t, visibleRemaining.length, remainingListings.length)}
                </p>
              </div>

              {isLoading || isFetchingProducts ? (
                <div className="agrivo-harvest-all-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <HarvestListingSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <>
                  <HarvestListingGrid
                    listings={visibleRemaining}
                    selectedListingId={selectedProductId}
                    className="agrivo-harvest-all-grid"
                  />
                  {hasMoreRemaining ? (
                    <div className="agrivo-marketplace-load-more agrivo-marketplace-load-more--all-listings">
                      <Button
                        variant="outline"
                        className="agrivo-marketplace-load-more-btn"
                        onClick={() => setVisibleCount((count) => count + REMAINING_PAGE_SIZE)}
                      >
                        {t("marketplace.loadMore")}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          ) : null}
        </section>
      </div>

      <div className="agrivo-harvest-mobile-bar">
        <Button
          variant="outline"
          className="agrivo-harvest-mobile-bar-btn"
          onClick={() => {
            setShowMobileFilters((value) => !value);
            setShowMobileMap(false);
          }}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("marketplace.mobileFilter")}
        </Button>
        <Button
          variant="outline"
          className="agrivo-harvest-mobile-bar-btn"
          onClick={() => {
            setShowMobileMap((value) => !value);
            setShowMobileFilters(false);
          }}
        >
          <Map className="mr-2 h-4 w-4" />
          {t("marketplace.mobileMap")}
        </Button>
      </div>
    </div>
  );
}
