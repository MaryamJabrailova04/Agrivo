import { Map, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  formatJobsAvailable,
  formatSearchChip,
  formatSignedInAs,
  translateCropType,
  translateDateFilterLabel,
  translateJobType,
} from "../../i18n/jobHelpers";
import { AzerbaijanMap } from "../components/AzerbaijanMap";
import { FarmJobCard } from "../components/jobs/FarmJobCard";
import { getAuthUser, isFarmerUser, isLoggedIn } from "../auth/authStorage";
import type { EconomicRegion } from "../data/azerbaijanRegions";
import { getDistrictsForJobRegion } from "../data/economicRegionDistricts";
import {
  CROP_TYPES,
  JOB_TYPES,
  defaultJobFilters,
  filterFarmJobs,
  getEconomicRegionForLocation,
  getRegionJobCounts,
  type JobFilters,
} from "../data/farmJobs";
import { getAllFarmJobs } from "../data/farmJobsStorage";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../components/ui/utils";

const filterTriggerClass =
  "agrivo-filter-control h-12 rounded-full border-[#DEECE0] bg-[#F7FBF5] text-sm text-[#102018] sm:h-14 sm:text-base";

const heroChipKeys = [
  "jobs.page.chips.seasonalHarvest",
  "jobs.page.chips.dailyPayment",
  "jobs.page.chips.verifiedFarmers",
] as const;

export default function JobsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<JobFilters>(defaultJobFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const allJobs = useMemo(() => getAllFarmJobs(), []);
  const filteredJobs = useMemo(() => filterFarmJobs(allJobs, filters), [allJobs, filters]);
  const regionJobCounts = useMemo(() => getRegionJobCounts(allJobs, filters), [allJobs, filters]);

  const selectedMapRegion =
    filters.economicRegion === "all" ? "all" : (filters.economicRegion as EconomicRegion);

  const locationOptions = useMemo(
    () =>
      getDistrictsForJobRegion(
        filters.economicRegion === "all" ? "all" : (filters.economicRegion as EconomicRegion),
      ),
    [filters.economicRegion],
  );

  const hasLocationOrRegionFilter =
    filters.location !== "all" || filters.economicRegion !== "all";

  useEffect(() => {
    if (filters.location === "all") return;
    const isValid = locationOptions.some((district) => district === filters.location);
    if (!isValid) {
      setFilters((prev) => ({ ...prev, location: "all" }));
    }
  }, [filters.location, locationOptions]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.jobType !== "all") count++;
    if (filters.cropType !== "all") count++;
    if (filters.location !== "all") count++;
    if (filters.economicRegion !== "all") count++;
    if (filters.dateRange !== "any") count++;
    if (filters.payMin || filters.payMax) count++;
    if (filters.mealsIncluded) count++;
    if (filters.transportIncluded) count++;
    if (filters.housingIncluded) count++;
    if (filters.experienceRequired !== null) count++;
    return count;
  }, [filters]);

  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.location !== "all") {
      chips.push({
        key: "location",
        label: filters.location,
        onRemove: () => {
          setFilters((prev) => ({ ...prev, location: "all" }));
        },
      });
    } else if (filters.economicRegion !== "all") {
      chips.push({
        key: "region",
        label: filters.economicRegion,
        onRemove: () => {
          setFilters((prev) => ({ ...prev, economicRegion: "all" }));
        },
      });
    }

    if (filters.cropType !== "all") {
      chips.push({
        key: "crop",
        label: translateCropType(t, filters.cropType),
        onRemove: () => setFilters((prev) => ({ ...prev, cropType: "all" })),
      });
    }

    if (filters.jobType !== "all") {
      chips.push({
        key: "jobType",
        label: translateJobType(t, filters.jobType),
        onRemove: () => setFilters((prev) => ({ ...prev, jobType: "all" })),
      });
    }

    if (filters.dateRange !== "any") {
      chips.push({
        key: "date",
        label: translateDateFilterLabel(t, filters.dateRange),
        onRemove: () => setFilters((prev) => ({ ...prev, dateRange: "any" })),
      });
    }

    if (filters.search.trim()) {
      chips.push({
        key: "search",
        label: formatSearchChip(t, filters.search.trim()),
        onRemove: () => setFilters((prev) => ({ ...prev, search: "" })),
      });
    }

    return chips;
  }, [filters, t]);

  const handleLocationChange = (location: string) => {
    if (location === "all") {
      setFilters((prev) => ({ ...prev, location: "all" }));
      return;
    }

    const region = getEconomicRegionForLocation(location);
    setFilters((prev) => ({
      ...prev,
      location,
      economicRegion: region !== "all" ? region : prev.economicRegion,
    }));
  };

  const handleMapRegionSelect = (region: EconomicRegion | "all") => {
    setFilters((prev) => ({
      ...prev,
      economicRegion: region,
      location: "all",
    }));
  };

  const clearFilters = () => {
    setFilters(defaultJobFilters);
    setShowAdvanced(false);
  };

  const user = getAuthUser();
  const farmer = isFarmerUser();

  const mapPanel = (
    <AzerbaijanMap
      selectedRegion={selectedMapRegion}
      onRegionSelect={handleMapRegionSelect}
      regionJobCounts={regionJobCounts}
      variant="jobs"
      prominent
    />
  );

  const jobsList = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#5F6F64]">
          <span className="font-semibold text-[#102018]">
            {formatJobsAvailable(t, filteredJobs.length)}
          </span>
        </p>
        {!isLoggedIn() ? (
          <p className="hidden text-xs text-[#6b7a70] sm:block">{t("jobs.page.results.loginNotice")}</p>
        ) : user ? (
          <p className="hidden text-xs text-[#6b7a70] sm:block">
            {formatSignedInAs(t, user.name)}
          </p>
        ) : null}
      </div>

      {filteredJobs.length > 0 ? (
        <div
          className={cn(
            "agrivo-jobs-grid mt-6",
            showMap ? "agrivo-jobs-grid--with-map" : "agrivo-jobs-grid--full",
          )}
        >
          {filteredJobs.map((job) => (
            <FarmJobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="agrivo-jobs-empty mt-10 rounded-[28px] border border-dashed border-[#d8e8d4] bg-white/70 px-6 py-16 text-center">
          <h2 className="agrivo-heading text-xl font-bold text-[#102018]">
            {t("jobs.page.empty.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F64]">
            {hasLocationOrRegionFilter
              ? t("jobs.page.empty.subtitleLocation")
              : t("jobs.page.empty.subtitleGeneral")}
          </p>
          <Button
            className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={clearFilters}
          >
            {t("jobs.page.empty.clearFilters")}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="agrivo-shell agrivo-farm-jobs min-h-screen">
      <AgrivoNavbar activeItem="jobs" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <div className="agrivo-container py-8 sm:py-10">
        <div className="agrivo-jobs-hero mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:text-sm">
            {t("jobs.page.eyebrow")}
          </p>
          <h1 className="agrivo-heading text-3xl font-bold text-[#102018] sm:text-4xl md:text-5xl">
            {t("jobs.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5F6F64] sm:text-base">
            {t("jobs.subtitleLong")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {heroChipKeys.map((chipKey) => (
              <span
                key={chipKey}
                className="rounded-full border border-[#dbe7d4] bg-white px-4 py-1.5 text-xs font-medium text-[#14532D] sm:text-sm"
              >
                {t(chipKey)}
              </span>
            ))}
          </div>

          {farmer ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                className="agrivo-button-soft rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B]"
                onClick={() => {
                  navigateToHash("dashboard/jobs/new");
                }}
              >
                {t("jobs.createJobPost")}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={() => {
                  navigateToHash("dashboard/jobs");
                }}
              >
                {t("jobs.myJobPostsLink")}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="agrivo-jobs-filters agrivo-reveal mt-10 rounded-[28px] border border-[#e5efe1] bg-white p-5 shadow-[0_10px_28px_rgba(20,83,45,0.04)] sm:p-6 md:mt-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <Label className="text-sm font-semibold text-[#14532D]">
                {t("jobs.page.filters.search")}
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a70]" />
                <Input
                  className={`${filterTriggerClass} pl-11`}
                  placeholder={t("jobs.page.filters.searchPlaceholder")}
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#14532D]">
                {t("jobs.page.filters.jobType")}
              </Label>
              <Select value={filters.jobType} onValueChange={(v) => updateFilter("jobType", v)}>
                <SelectTrigger className={filterTriggerClass}>
                  <SelectValue placeholder={t("jobs.page.filters.allJobTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.page.filters.allJobTypes")}</SelectItem>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {translateJobType(t, type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#14532D]">
                {t("jobs.page.filters.cropType")}
              </Label>
              <Select value={filters.cropType} onValueChange={(v) => updateFilter("cropType", v)}>
                <SelectTrigger className={filterTriggerClass}>
                  <SelectValue placeholder={t("jobs.page.filters.allCrops")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.page.filters.allCrops")}</SelectItem>
                  {CROP_TYPES.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {translateCropType(t, crop)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#14532D]">
                {t("jobs.page.filters.location")}
              </Label>
              <Select value={filters.location} onValueChange={handleLocationChange}>
                <SelectTrigger className={filterTriggerClass}>
                  <SelectValue placeholder={t("jobs.page.filters.allLocations")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.page.filters.allLocations")}</SelectItem>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Label className="text-sm font-semibold text-[#14532D]">
                {t("jobs.page.filters.date")}
              </Label>
              <Select value={filters.dateRange} onValueChange={(v) => updateFilter("dateRange", v)}>
                <SelectTrigger className={filterTriggerClass}>
                  <SelectValue placeholder={t("jobs.page.filters.anyDate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("jobs.page.filters.anyDate")}</SelectItem>
                  <SelectItem value="this-week">{t("jobs.page.filters.thisWeek")}</SelectItem>
                  <SelectItem value="this-month">{t("jobs.page.filters.thisMonth")}</SelectItem>
                  <SelectItem value="upcoming">{t("jobs.page.filters.upcoming")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant={showMap ? "default" : "outline"}
              className={cn(
                "rounded-full",
                showMap
                  ? "bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                  : "border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]",
              )}
              onClick={() => setShowMap((v) => !v)}
            >
              <Map className="mr-2 h-4 w-4" />
              {showMap ? t("jobs.page.filters.hideMap") : t("jobs.page.filters.mapView")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t("jobs.page.filters.advancedFilters")}
              {activeFilterCount > 0 ? (
                <span className="ml-2 rounded-full bg-[#14532D] px-2 py-0.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>

            {activeFilterCount > 0 || filters.search ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-[#5F6F64] hover:bg-[#EAF7EC] hover:text-[#14532D]"
                onClick={clearFilters}
              >
                <X className="mr-1 h-4 w-4" />
                {t("jobs.page.filters.clearFilters")}
              </Button>
            ) : null}
          </div>

          {activeChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#edf2ea] pt-4">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="agrivo-farmers-chip inline-flex items-center gap-2 rounded-full bg-[#EAF7EC] px-4 py-2 text-sm font-medium text-[#14532D] transition hover:bg-[#D5F4D9]"
                >
                  {chip.label}
                  <X className="h-4 w-4" />
                </button>
              ))}
            </div>
          ) : null}

          {showAdvanced ? (
            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#edf2ea] pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#14532D]">
                  {t("jobs.page.filters.payUnit")}
                </Label>
                <Input
                  type="number"
                  min={0}
                  className={filterTriggerClass}
                  placeholder={t("jobs.page.filters.minPayPlaceholder")}
                  value={filters.payMin}
                  onChange={(e) => updateFilter("payMin", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#14532D]">
                  {t("jobs.page.filters.maxPayUnit")}
                </Label>
                <Input
                  type="number"
                  min={0}
                  className={filterTriggerClass}
                  placeholder={t("jobs.page.filters.maxPayPlaceholder")}
                  value={filters.payMax}
                  onChange={(e) => updateFilter("payMax", e.target.value)}
                />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <Label className="text-sm font-semibold text-[#14532D]">
                  {t("jobs.page.filters.benefitsExperience")}
                </Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filters.mealsIncluded}
                      onCheckedChange={(c) => updateFilter("mealsIncluded", c === true)}
                    />
                    {t("jobs.page.filters.mealsIncluded")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filters.transportIncluded}
                      onCheckedChange={(c) => updateFilter("transportIncluded", c === true)}
                    />
                    {t("jobs.page.filters.transportIncluded")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filters.housingIncluded}
                      onCheckedChange={(c) => updateFilter("housingIncluded", c === true)}
                    />
                    {t("jobs.page.filters.housingIncluded")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#3f5247]">
                    <Checkbox
                      checked={filters.experienceRequired === false}
                      onCheckedChange={(c) =>
                        updateFilter("experienceRequired", c === true ? false : null)
                      }
                    />
                    {t("jobs.page.filters.noExperienceRequired")}
                  </label>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 sm:mt-10">
          {showMap ? (
            <div className="agrivo-jobs-map-mobile mb-8 lg:hidden">{mapPanel}</div>
          ) : null}

          {showMap ? (
            <div className="agrivo-jobs-layout hidden lg:grid">
              <div className="agrivo-jobs-results min-w-0">{jobsList}</div>
              <div className="agrivo-jobs-map-card min-w-0">{mapPanel}</div>
            </div>
          ) : null}

          <div className={cn(showMap && "lg:hidden")}>{jobsList}</div>
        </div>
      </div>
    </div>
  );
}
