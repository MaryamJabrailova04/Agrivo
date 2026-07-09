import { motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import azerbaijanDistricts from "../data/azerbaijanDistricts.json";
import {
  MAP_SIZE,
  getRegionLabelCountOffset,
  getRegionLabelFontSize,
  getRegionLabelLineHeight,
  regionLabelCentroids,
  regionLabelLines,
  regionPalette,
  type MapLabelScale,
} from "../data/azerbaijanMapStyles";
import type { EconomicRegion } from "../data/azerbaijanRegions";
import { geometryToSvgPath, projectPoint } from "../utils/geoToSvg";

interface AzerbaijanMapProps {
  selectedRegion: EconomicRegion | "all";
  onRegionSelect: (region: EconomicRegion | "all") => void;
  regionJobCounts?: Partial<Record<EconomicRegion, number>>;
  variant?: "farmers" | "jobs";
  compact?: boolean;
  prominent?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const STROKE = "#3D5235";
const STROKE_SELECTED = "#1F4D36";

type DistrictPath = {
  shapeID: string;
  district: string;
  region: EconomicRegion;
  path: string;
};

const LABEL_FILL = "#123D28";
const LABEL_FILL_ACTIVE = "#081F12";
const LABEL_STROKE = "#F7FBF5";

function RegionLabels({
  activeRegion,
  selectedRegion,
  labelScale = "default",
}: {
  activeRegion: EconomicRegion | null;
  selectedRegion: EconomicRegion | "all";
  labelScale?: MapLabelScale;
}) {
  return (
    <g pointerEvents="none" className="agrivo-region-labels select-none">
      {(Object.keys(regionLabelCentroids) as EconomicRegion[]).map((regionId) => {
        const [x, y] = projectPoint(regionLabelCentroids[regionId]);
        const lines = regionLabelLines[regionId];
        const isSelected = selectedRegion === regionId;
        const isHovered = activeRegion === regionId;
        const isActive = isHovered || isSelected;
        const fontSize = getRegionLabelFontSize(regionId, labelScale);
        const lineHeight = getRegionLabelLineHeight(fontSize);
        const firstLineOffset = -((lines.length - 1) * lineHeight) / 2;

        return (
          <text
            key={regionId}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="agrivo-region-label"
            fill={isActive ? LABEL_FILL_ACTIVE : LABEL_FILL}
            fontSize={fontSize}
            fontWeight={isSelected ? 800 : isHovered ? 750 : 700}
            fontFamily="Manrope, Inter, Arial, sans-serif"
            stroke={LABEL_STROKE}
            strokeWidth={isActive ? 0.55 : 0.4}
            paintOrder="stroke fill"
            opacity={isSelected ? 1 : isHovered ? 0.98 : 0.94}
          >
            {lines.map((line, index) => (
              <tspan key={line} x={x} dy={index === 0 ? firstLineOffset : lineHeight}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </g>
  );
}

function RegionJobCountBadges({
  regionJobCounts,
  labelScale = "default",
}: {
  regionJobCounts: Partial<Record<EconomicRegion, number>>;
  labelScale?: MapLabelScale;
}) {
  const { t } = useLanguage();

  return (
    <g pointerEvents="none" className="select-none">
      {(Object.entries(regionJobCounts) as Array<[EconomicRegion, number]>).map(([region, count]) => {
        if (!count) return null;
        const [x, y] = projectPoint(regionLabelCentroids[region]);
        const lines = regionLabelLines[region];
        const fontSize = getRegionLabelFontSize(region, labelScale);
        const offsetY = getRegionLabelCountOffset(lines.length, fontSize);
        const badgeFontSize = Math.max(9, Math.round(fontSize * 0.72));
        const countKey = count === 1 ? "jobs.page.map.jobCountSingular" : "jobs.page.map.jobCount";
        const countLabel = t(countKey).replace("{count}", String(count));

        return (
          <g key={`count-${region}`}>
            <rect
              x={x - 22}
              y={y + offsetY - 10}
              width={44}
              height={20}
              rx={10}
              fill="#14532D"
              opacity={0.94}
            />
            <text
              x={x}
              y={y + offsetY + 5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={badgeFontSize}
              fontWeight={700}
              fontFamily="Manrope, Inter, Arial, sans-serif"
            >
              {countLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function AzerbaijanMap({
  selectedRegion,
  onRegionSelect,
  regionJobCounts,
  variant = "farmers",
  compact = false,
  prominent = false,
}: AzerbaijanMapProps) {
  const { t } = useLanguage();
  const [hoveredRegion, setHoveredRegion] = useState<EconomicRegion | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<EconomicRegion | null>(null);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsNarrowViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const labelScale: MapLabelScale = prominent
    ? isNarrowViewport
      ? "default"
      : "prominent"
    : compact
      ? "compact"
      : "default";

  const shadowFilterId = useId();
  const glowFilterId = useId();

  const districts = useMemo<DistrictPath[]>(
    () =>
      azerbaijanDistricts.features.map((feature) => ({
        shapeID: feature.properties.shapeID,
        district: feature.properties.district,
        region: feature.properties.economicRegion as EconomicRegion,
        path: geometryToSvgPath(feature.geometry),
      })),
    [],
  );

  const tooltipRegion = hoveredRegion ?? focusedRegion;
  const tooltipCentroid = tooltipRegion ? regionLabelCentroids[tooltipRegion] : null;

  const handleSelect = useCallback(
    (region: EconomicRegion) => {
      onRegionSelect(selectedRegion === region ? "all" : region);
    },
    [onRegionSelect, selectedRegion],
  );

  const getRegionFill = (region: EconomicRegion) => {
    const palette = regionPalette[region];
    const isSelected = selectedRegion === region;
    const isActive = isSelected || hoveredRegion === region || focusedRegion === region;
    if (isSelected) return palette.fillSelected;
    if (isActive) return palette.fillHover;
    return palette.fill;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`agrivo-map-card relative overflow-hidden rounded-[28px] border border-[#DEECE0] bg-[#F7FBF5] shadow-[0_24px_60px_rgba(20,83,45,0.1)] ${
        prominent
          ? "p-4 shadow-[0_28px_70px_rgba(20,83,45,0.12)] sm:rounded-[32px] sm:p-5"
          : compact
            ? "p-3 sm:rounded-[24px] sm:p-4"
            : "p-4 sm:rounded-[32px] sm:p-5 lg:p-6"
      }`}
    >
      <div className={`flex items-start justify-between gap-3 ${prominent ? "mb-3" : "mb-4"}`}>
        <div>
          <p className="agrivo-map-eyebrow uppercase text-[#15803d]">
            {variant === "jobs" ? t("jobs.page.map.eyebrow") : t("farmersPage.map.eyebrow")}
          </p>
          <p className="agrivo-map-helper mt-1.5 text-[#5F6F64] sm:mt-2">
            {variant === "jobs" ? t("jobs.page.map.subtitle") : t("farmersPage.map.subtitle")}
          </p>
          {variant === "jobs" && prominent ? (
            <p className="mt-1 text-xs text-[#6b7a70]">{t("jobs.page.map.filterHint")}</p>
          ) : null}
        </div>
        {selectedRegion !== "all" && (
          <button
            type="button"
            onClick={() => onRegionSelect("all")}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#14532D] shadow-sm ring-1 ring-[#DEECE0] transition hover:bg-[#EAF7EC]"
          >
            {variant === "jobs" ? t("jobs.page.map.resetMap") : t("farmersPage.map.resetMap")}
          </button>
        )}
      </div>

      <div
        className={`agrivo-map-stage relative overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#F3F8F1_0%,#EAF4E8_100%)] ring-1 ring-[#E3EEE4] ${
          prominent ? "agrivo-map-stage--prominent p-2 sm:p-2.5" : "p-2 sm:p-3"
        }`}
      >
        <svg
          viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
          className={`agrivo-map-svg mx-auto block h-auto w-full ${
            prominent
              ? "min-h-[320px] max-h-none sm:min-h-[360px]"
              : compact
                ? "max-h-[320px]"
                : "max-h-[440px]"
          }`}
          role="img"
          aria-label={variant === "jobs" ? t("jobs.page.map.ariaLabel") : t("farmersPage.map.ariaLabel")}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id={shadowFilterId} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#2D4A22" floodOpacity="0.12" />
            </filter>
            <filter id={glowFilterId} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1F4D36" floodOpacity="0.22" />
            </filter>
          </defs>

          <rect width={MAP_SIZE.width} height={MAP_SIZE.height} fill="transparent" />

          <g filter={`url(#${shadowFilterId})`}>
            {districts.map((district) => {
              const isSelected = selectedRegion === district.region;
              const isHovered = hoveredRegion === district.region;
              const isFocused = focusedRegion === district.region;
              const isActive = isSelected || isHovered || isFocused;

              return (
                <motion.path
                  key={district.shapeID}
                  d={district.path}
                  fill={getRegionFill(district.region)}
                  stroke={isActive ? STROKE : getRegionFill(district.region)}
                  strokeWidth={isSelected ? 1.6 : isActive ? 1.2 : 1}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer touch-manipulation outline-none"
                  style={{
                    filter: isSelected ? `url(#${glowFilterId})` : undefined,
                  }}
                  animate={{
                    fill: getRegionFill(district.region),
                  }}
                  transition={{ duration: 0.22, ease: EASE }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    variant === "jobs"
                      ? t("jobs.page.map.selectRegionAria").replace("{region}", district.region)
                      : t("farmersPage.map.selectRegionAria").replace("{region}", district.region)
                  }
                  aria-pressed={isSelected}
                  onMouseEnter={() => setHoveredRegion(district.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onFocus={() => setFocusedRegion(district.region)}
                  onBlur={() => setFocusedRegion(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelect(district.region);
                    }
                  }}
                  onClick={() => handleSelect(district.region)}
                />
              );
            })}
          </g>

          <RegionLabels
            activeRegion={hoveredRegion ?? focusedRegion}
            selectedRegion={selectedRegion}
            labelScale={labelScale}
          />

          {regionJobCounts ? (
            <RegionJobCountBadges regionJobCounts={regionJobCounts} labelScale={labelScale} />
          ) : null}
        </svg>

        {tooltipCentroid && tooltipRegion && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+8px)]"
            style={{
              left: `${(projectPoint(tooltipCentroid)[0] / MAP_SIZE.width) * 100}%`,
              top: `${(projectPoint(tooltipCentroid)[1] / MAP_SIZE.height) * 100}%`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="rounded-full border border-[#DEECE0] bg-white px-3 py-1.5 text-xs font-semibold text-[#14532D] shadow-[0_8px_24px_rgba(20,83,45,0.12)]"
            >
              {tooltipRegion}
            </motion.div>
          </div>
        )}
      </div>

      <div className={`flex justify-center ${prominent ? "mt-3" : "mt-4"}`}>
        {selectedRegion !== "all" ? (
          <motion.span
            key={selectedRegion}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="agrivo-map-status inline-flex items-center rounded-full bg-[#EAF7EC] px-4 py-2 text-sm font-medium text-[#14532D] ring-1 ring-[#D5EED8]"
          >
            {variant === "jobs"
              ? t("jobs.page.map.selectedRegion").replace("{region}", selectedRegion)
              : t("farmersPage.map.selectedRegion").replace("{region}", selectedRegion)}
          </motion.span>
        ) : (
          <p className="agrivo-map-status text-sm text-[#6F7F74]">
            {variant === "jobs" ? t("jobs.page.map.selectRegion") : t("farmersPage.map.selectRegion")}
          </p>
        )}
      </div>
    </motion.div>
  );
}
