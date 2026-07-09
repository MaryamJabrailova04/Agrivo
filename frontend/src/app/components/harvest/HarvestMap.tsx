import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  formatMapTooltipFarmers,
  formatMapTooltipListings,
  localizeHarvestListing,
} from "../../../i18n/marketplaceHelpers";
import azerbaijanDistricts from "../../data/azerbaijanDistricts.json";
import type { EconomicRegion } from "../../data/azerbaijanRegions";
import {
  MAP_SIZE,
  regionLabelCentroids,
  regionLabelLines,
  regionPalette,
} from "../../data/azerbaijanMapStyles";
import type { HarvestListing } from "../../data/harvestExplorer";
import { getHeatmapIntensity } from "../../data/harvestExplorer";
import {
  districtsMatchGeo,
  geoDistrictShortLabel,
  productPin,
} from "../../data/harvestExplorerUtils";
import { geometryToSvgPath, projectPoint } from "../../utils/geoToSvg";

const EASE = [0.22, 1, 0.36, 1] as const;
const STROKE = "#3D5235";
const STROKE_SELECTED = "#14532D";
const DISTRICT_STROKE = "#2E5C32";

type DistrictPath = {
  shapeID: string;
  district: string;
  region: EconomicRegion;
  path: string;
  bounds: ReturnType<typeof parsePathBounds>;
};

interface RegionStats {
  listingCount: number;
  farmerCount: number;
  topProducts: string[];
}

interface DistrictStats {
  listingCount: number;
  farmerCount: number;
  topProducts: string[];
}

interface HarvestMapProps {
  selectedRegion: EconomicRegion | "all";
  selectedDistrict: string | "all";
  selectedProductId: string | null;
  productChip: string | null;
  listings: HarvestListing[];
  regionStats: Partial<Record<EconomicRegion, RegionStats>>;
  onRegionSelect: (region: EconomicRegion | "all") => void;
  onDistrictSelect: (district: string | "all") => void;
  onProductSelect: (listing: HarvestListing | null) => void;
  panelHoveredDistrict?: string | null;
  onDistrictHover?: (district: string | null) => void;
}

function parsePathBounds(path: string) {
  const numbers = path.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = numbers[i];
    const y = numbers[i + 1];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  return { minX, minY, maxX, maxY, width, height, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function labelFontSize(bounds: DistrictPath["bounds"]) {
  const size = Math.min(bounds.width, bounds.height);
  if (size < 28) return 6.5;
  if (size < 42) return 7.5;
  if (size < 60) return 8.5;
  return 9.5;
}

function districtMapLabel(district: string, bounds: DistrictPath["bounds"]) {
  const full = geoDistrictShortLabel(district);
  const size = Math.min(bounds.width, bounds.height);
  if (size >= 36 || full.length <= 8) return full;
  if (full.length <= 10) return full;
  return `${full.slice(0, 7)}…`;
}

function RegionLabels({
  activeRegion,
  selectedRegion,
}: {
  activeRegion: EconomicRegion | null;
  selectedRegion: EconomicRegion | "all";
}) {
  return (
    <g pointerEvents="none" className="select-none">
      {(Object.keys(regionLabelCentroids) as EconomicRegion[]).map((regionId) => {
        const [x, y] = projectPoint(regionLabelCentroids[regionId]);
        const lines = regionLabelLines[regionId];
        const isActive = activeRegion === regionId || selectedRegion === regionId;
        const fontSize = regionId === "Bakı" ? 8.5 : lines.length > 1 ? 9.5 : 10.5;
        const lineHeight = fontSize + 2.5;

        return (
          <text
            key={regionId}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={STROKE_SELECTED}
            fontSize={fontSize}
            fontWeight={700}
            fontFamily="Manrope, Inter, Arial, sans-serif"
            opacity={isActive ? 1 : 0.92}
          >
            {lines.map((line, index) => (
              <tspan key={line} x={x} dy={index === 0 ? 0 : lineHeight}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </g>
  );
}

function DistrictLabels({
  districts,
  hoveredDistrict,
  selectedDistrict,
}: {
  districts: DistrictPath[];
  hoveredDistrict: string | null;
  selectedDistrict: string | "all";
}) {
  return (
    <g pointerEvents="none" className="select-none">
      {districts.map((district) => {
        const label = districtMapLabel(district.district, district.bounds);
        const fontSize = labelFontSize(district.bounds);
        const isActive =
          hoveredDistrict === district.district ||
          districtsMatchGeo(district.district, selectedDistrict);
        const { cx, cy } = district.bounds;

        return (
          <g key={`label-${district.shapeID}`}>
            <rect
              x={cx - label.length * (fontSize * 0.34)}
              y={cy - fontSize * 0.72}
              width={label.length * (fontSize * 0.68)}
              height={fontSize * 1.45}
              rx={fontSize * 0.45}
              fill="rgba(255, 255, 255, 0.82)"
              opacity={isActive ? 0.98 : 0.88}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? STROKE_SELECTED : STROKE}
              fontSize={fontSize}
              fontWeight={isActive ? 700 : 600}
              fontFamily="Manrope, Inter, Arial, sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function getDistrictListingStats(
  geoDistrict: string,
  region: EconomicRegion,
  listings: HarvestListing[],
): DistrictStats {
  const matched = listings.filter(
    (item) =>
      item.economicRegion === region &&
      (item.district === geoDistrict || districtsMatchGeo(geoDistrict, item.district)),
  );
  const farmers = new Set(matched.map((item) => item.farmer));
  const productCounts = matched.reduce<Record<string, number>>((acc, item) => {
    acc[item.productType] = (acc[item.productType] ?? 0) + 1;
    return acc;
  }, {});
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([product]) => product);

  return {
    listingCount: matched.length,
    farmerCount: farmers.size,
    topProducts,
  };
}

export function HarvestMap({
  selectedRegion,
  selectedDistrict,
  selectedProductId,
  productChip,
  listings,
  regionStats,
  onRegionSelect,
  onDistrictSelect,
  onProductSelect,
  panelHoveredDistrict = null,
  onDistrictHover,
}: HarvestMapProps) {
  const { t } = useLanguage();
  const [hoveredRegion, setHoveredRegion] = useState<EconomicRegion | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<EconomicRegion | null>(null);

  const shadowFilterId = useId();
  const glowFilterId = useId();
  const districtGlowId = useId();
  const pinGlowId = useId();

  const districts = useMemo<DistrictPath[]>(
    () =>
      azerbaijanDistricts.features.map((feature) => {
        const path = geometryToSvgPath(feature.geometry);
        return {
          shapeID: feature.properties.shapeID,
          district: feature.properties.district,
          region: feature.properties.economicRegion as EconomicRegion,
          path,
          bounds: parsePathBounds(path),
        };
      }),
    [],
  );

  const visibleDistricts = useMemo(() => {
    if (selectedRegion === "all") return districts;
    return districts.filter((district) => district.region === selectedRegion);
  }, [districts, selectedRegion]);

  const viewBox = useMemo(() => {
    if (selectedRegion === "all") {
      return `0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`;
    }
    const bounds = visibleDistricts.map((district) => district.bounds);
    if (!bounds.length) return `0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`;
    const minX = Math.min(...bounds.map((b) => b.minX)) - 28;
    const minY = Math.min(...bounds.map((b) => b.minY)) - 28;
    const maxX = Math.max(...bounds.map((b) => b.maxX)) + 28;
    const maxY = Math.max(...bounds.map((b) => b.maxY)) + 28;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [selectedRegion, visibleDistricts]);

  const districtPins = useMemo(() => {
    if (selectedRegion === "all" || selectedDistrict === "all") return [];

    const districtPath = visibleDistricts.find((d) => districtsMatchGeo(d.district, selectedDistrict));
    if (!districtPath) return [];

    const districtListings = listings.filter(
      (item) =>
        item.economicRegion === selectedRegion &&
        districtsMatchGeo(districtPath.district, item.district),
    );

    const uniqueProducts = [...new Set(districtListings.map((item) => item.productType))].slice(0, 8);
    const center = districtPath.bounds;
    const baseRadius = Math.min(center.width, center.height) * 0.22;
    const radius = Math.max(28, Math.min(baseRadius, 52));

    return uniqueProducts.map((productType, index) => {
      const listing = districtListings.find((item) => item.productType === productType)!;
      const angle = (index / uniqueProducts.length) * Math.PI * 2 - Math.PI / 2;
      return {
        listing,
        productType,
        x: center.cx + Math.cos(angle) * radius,
        y: center.cy + Math.sin(angle) * radius,
      };
    });
  }, [listings, selectedDistrict, selectedRegion, visibleDistricts]);

  const selectedPin = useMemo(
    () => districtPins.find((pin) => pin.listing.id === selectedProductId) ?? null,
    [districtPins, selectedProductId],
  );

  const popupListing = selectedPin?.listing ?? null;
  const displayPopupListing = useMemo(
    () => (popupListing ? localizeHarvestListing(t, popupListing) : null),
    [popupListing, t],
  );

  useEffect(() => {
    if (selectedProductId && !selectedPin) {
      onProductSelect(null);
    }
  }, [selectedProductId, selectedPin, onProductSelect]);

  const tooltipRegion = hoveredRegion ?? focusedRegion;
  const tooltipDistrict = hoveredDistrict;
  const isDistrictView = selectedRegion !== "all";

  const panelHighlightDistrict = useMemo(() => {
    if (!panelHoveredDistrict || selectedRegion === "all") return null;
    return (
      visibleDistricts.find((district) => districtsMatchGeo(district.district, panelHoveredDistrict))
        ?.district ?? null
    );
  }, [panelHoveredDistrict, selectedRegion, visibleDistricts]);

  const getDistrictHoverState = useCallback(
    (geoDistrict: string) => {
      if (hoveredDistrict === geoDistrict) return true;
      if (panelHighlightDistrict === geoDistrict) return true;
      return false;
    },
    [hoveredDistrict, panelHighlightDistrict],
  );

  const districtTooltipStats = useMemo(() => {
    if (!tooltipDistrict || selectedRegion === "all") return null;
    return getDistrictListingStats(tooltipDistrict, selectedRegion, listings);
  }, [listings, selectedRegion, tooltipDistrict]);

  const breadcrumbDistrict =
    selectedDistrict !== "all"
      ? geoDistrictShortLabel(
          visibleDistricts.find((d) => districtsMatchGeo(d.district, selectedDistrict))?.district ??
            selectedDistrict,
        )
      : null;

  const getRegionFill = useCallback(
    (region: EconomicRegion) => {
      const palette = regionPalette[region];
      const intensity = getHeatmapIntensity(region, listings, productChip);
      const isSelected = selectedRegion === region;
      const isActive = isSelected || hoveredRegion === region || focusedRegion === region;

      if (productChip && intensity > 0.15) {
        const alpha = 0.18 + intensity * 0.42;
        if (isSelected) return `rgba(20, 83, 45, ${0.45 + intensity * 0.25})`;
        if (isActive) return `rgba(46, 125, 50, ${0.28 + intensity * 0.3})`;
        return `rgba(67, 160, 71, ${alpha})`;
      }

      if (isSelected) return palette.fillSelected;
      if (isActive) return palette.fillHover;
      return palette.fill;
    },
    [focusedRegion, hoveredRegion, listings, productChip, selectedRegion],
  );

  const getDistrictFill = useCallback(
    (district: DistrictPath, isSelected: boolean, isHovered: boolean) => {
      const base = regionPalette[district.region].fill;
      if (isSelected) return "rgba(20, 83, 45, 0.38)";
      if (isHovered) return "rgba(67, 160, 71, 0.32)";
      return base;
    },
    [],
  );

  const handleRegionClick = (region: EconomicRegion) => {
    onProductSelect(null);
    onRegionSelect(region);
    onDistrictSelect("all");
  };

  const handleDistrictClick = (geoDistrict: string) => {
    if (districtsMatchGeo(geoDistrict, selectedDistrict)) {
      onProductSelect(null);
      onDistrictSelect(geoDistrict);
      return;
    }
    onProductSelect(null);
    onDistrictSelect(geoDistrict);
  };

  const handleMapBackdropClick = () => {
    if (popupListing) onProductSelect(null);
  };

  const handleBackToAllRegions = () => {
    onProductSelect(null);
    onDistrictSelect("all");
    onRegionSelect("all");
  };

  return (
    <div className="agrivo-harvest-map relative shrink-0 rounded-[28px] border border-[#DEECE0] bg-[#F7FBF5] p-5 shadow-[0_24px_60px_rgba(20,83,45,0.08)] sm:rounded-[32px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#15803d]">
            {t("marketplace.map.eyebrow")}
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#102018] sm:text-xl">
            {t("marketplace.map.title")}
          </h3>
          <p className="mt-1 text-sm text-[#5F6F64]">{t("marketplace.map.subtitle")}</p>
        </div>
        {selectedRegion !== "all" ? (
          <button
            type="button"
            onClick={handleBackToAllRegions}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#14532D] shadow-sm ring-1 ring-[#DEECE0] transition hover:bg-[#EAF7EC]"
          >
            {t("marketplace.map.backToAll")}
          </button>
        ) : null}
      </div>

      {selectedRegion !== "all" ? (
        <p className="agrivo-harvest-map-breadcrumb mb-2 text-xs font-medium text-[#5F6F64]">
          {t("marketplace.map.breadcrumbCountry")} /{" "}
          <span className="text-[#14532D]">{selectedRegion}</span>
          {breadcrumbDistrict ? (
            <>
              {" "}
              / <span className="font-semibold text-[#14532D]">{breadcrumbDistrict}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {isDistrictView ? (
        <p className="agrivo-harvest-map-hint mb-3 text-[11px] text-[#7a8b80]">
          {t("marketplace.map.districtHint")}
        </p>
      ) : null}

      <div
        className={`agrivo-harvest-map-stage relative rounded-[22px] bg-[linear-gradient(160deg,#F3F8F1_0%,#EAF4E8_100%)] p-2 ring-1 ring-[#E3EEE4] sm:p-3 ${productChip ? "agrivo-harvest-map--pulse" : ""}`}
        onClick={handleMapBackdropClick}
      >
        <motion.svg
          viewBox={viewBox}
          className="agrivo-harvest-map-svg mx-auto block w-full"
          role="img"
          aria-label={t("marketplace.map.ariaLabel")}
          preserveAspectRatio="xMidYMid meet"
          animate={{ viewBox }}
          transition={{ duration: 0.55, ease: EASE }}
          onClick={(event) => event.stopPropagation()}
        >
          <defs>
            <filter id={shadowFilterId} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#2D4A22" floodOpacity="0.12" />
            </filter>
            <filter id={glowFilterId} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1F4D36" floodOpacity="0.22" />
            </filter>
            <filter id={districtGlowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#14532D" floodOpacity="0.35" />
            </filter>
            <filter id={pinGlowId} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#14532D" floodOpacity="0.35" />
            </filter>
          </defs>

          <g filter={`url(#${shadowFilterId})`}>
            {(selectedRegion === "all" ? districts : visibleDistricts).map((district) => {
              const isRegionView = selectedRegion === "all";
              const isSelected = isRegionView
                ? false
                : districtsMatchGeo(district.district, selectedDistrict);
              const isHovered = isRegionView
                ? hoveredRegion === district.region
                : getDistrictHoverState(district.district);
              const isActive = isSelected || isHovered;

              const fill = isRegionView
                ? getRegionFill(district.region)
                : getDistrictFill(district, isSelected, isHovered);

              return (
                <motion.path
                  key={district.shapeID}
                  d={district.path}
                  fill={fill}
                  stroke={isSelected ? STROKE_SELECTED : isActive ? DISTRICT_STROKE : STROKE}
                  strokeWidth={isSelected ? 2.2 : isDistrictView ? 1.35 : isActive ? 1.2 : 0.95}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer touch-manipulation outline-none"
                  style={{
                    filter: isSelected
                      ? `url(#${districtGlowId})`
                      : isRegionView && selectedRegion === district.region
                        ? `url(#${glowFilterId})`
                        : undefined,
                  }}
                  animate={{ fill }}
                  transition={{ duration: 0.22, ease: EASE }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${geoDistrictShortLabel(district.district)} district`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => {
                    if (isRegionView) setHoveredRegion(district.region);
                    else {
                      setHoveredDistrict(district.district);
                      onDistrictHover?.(district.district);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isRegionView) setHoveredRegion(null);
                    else {
                      setHoveredDistrict(null);
                      onDistrictHover?.(null);
                    }
                  }}
                  onFocus={() => {
                    if (isRegionView) setFocusedRegion(district.region);
                  }}
                  onBlur={() => setFocusedRegion(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isRegionView) {
                      handleRegionClick(district.region);
                    } else {
                      handleDistrictClick(district.district);
                    }
                  }}
                />
              );
            })}
          </g>

          {selectedRegion === "all" ? (
            <RegionLabels activeRegion={hoveredRegion ?? focusedRegion} selectedRegion={selectedRegion} />
          ) : (
            <DistrictLabels
              districts={visibleDistricts}
              hoveredDistrict={hoveredDistrict ?? panelHighlightDistrict}
              selectedDistrict={selectedDistrict}
            />
          )}

          {districtPins.map((pin) => {
            const isSelected = selectedProductId === pin.listing.id;
            return (
              <g
                key={`${selectedDistrict}-${pin.listing.id}`}
                transform={`translate(${pin.x}, ${pin.y})`}
                className="cursor-pointer"
                style={{ filter: isSelected ? `url(#${pinGlowId})` : undefined }}
                onClick={(event) => {
                  event.stopPropagation();
                  onProductSelect(isSelected ? null : pin.listing);
                }}
              >
                <circle
                  r={isSelected ? 11 : 9}
                  fill="white"
                  stroke={isSelected ? "#14532D" : "#5F6F64"}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <text textAnchor="middle" dominantBaseline="central" fontSize={isSelected ? 10 : 9}>
                  {productPin(pin.productType)}
                </text>
              </g>
            );
          })}
        </motion.svg>

        <AnimatePresence>
          {tooltipRegion && selectedRegion === "all" && !popupListing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="agrivo-harvest-map-tooltip pointer-events-none absolute bottom-3 left-3 z-20 max-w-[200px]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm font-bold text-[#14532D]">{tooltipRegion}</p>
              <p className="mt-1 text-xs text-[#5F6F64]">
                {formatMapTooltipListings(t, regionStats[tooltipRegion]?.listingCount ?? 0)}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {formatMapTooltipFarmers(t, regionStats[tooltipRegion]?.farmerCount ?? 0)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {tooltipDistrict && isDistrictView && districtTooltipStats && !popupListing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="agrivo-harvest-map-tooltip pointer-events-none absolute bottom-3 left-3 z-20 max-w-[200px]"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm font-bold text-[#14532D]">{geoDistrictShortLabel(tooltipDistrict)}</p>
              <p className="mt-1 text-xs text-[#5F6F64]">
                {formatMapTooltipListings(t, districtTooltipStats.listingCount)}
              </p>
              <p className="text-xs text-[#5F6F64]">
                {formatMapTooltipFarmers(t, districtTooltipStats.farmerCount)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {popupListing && selectedDistrict !== "all" && (
            <motion.div
              key={popupListing.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="agrivo-harvest-map-product-popup absolute left-3 top-3 z-30"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label={t("marketplace.map.closePopup")}
                className="agrivo-harvest-map-product-popup-close"
                onClick={() => onProductSelect(null)}
              >
                <X className="h-3 w-3" />
              </button>
              <p className="agrivo-harvest-map-product-popup-title">{displayPopupListing?.name}</p>
              <p className="agrivo-harvest-map-product-popup-farmer">{popupListing.farmer}</p>
              <p className="agrivo-harvest-map-product-popup-meta">{popupListing.quantity}</p>
              <p className="agrivo-harvest-map-product-popup-price">{popupListing.pricePerKg}</p>
              <button
                type="button"
                className="agrivo-harvest-map-product-popup-btn"
                onClick={() => {
                  navigateToHash("login");
                }}
              >
                {t("marketplace.map.viewProduct")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
