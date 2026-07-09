import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  formatCategoryChip,
  formatSearchChip,
  formatShowingFarmers,
  translateFarmerCategory,
} from "../../i18n/farmerHelpers";
import {
  economicRegions,
  getDistrictsForRegion,
  getRegionForDistrict,
  type EconomicRegion,
} from "../data/azerbaijanRegions";
import { getVillagesForDistrict, villagesMatch } from "../data/azerbaijanVillages";
import { allFarmers, farmerCategories } from "../data/farmers";
import { AzerbaijanMap } from "../components/AzerbaijanMap";
import { FeaturedFarmerCard } from "../components/FeaturedFarmerCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const reveal = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const filterTriggerClass =
  "agrivo-filter-control h-14 rounded-full border-[#DEECE0] bg-[#F7FBF5] text-base text-[#102018] sm:text-lg";

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="agrivo-filter-label block text-sm font-semibold text-[#14532D] sm:text-[0.9375rem]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function FarmersPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState<EconomicRegion | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");

  const districtOptions = useMemo(
    () => (regionFilter === "all" ? [] : getDistrictsForRegion(regionFilter)),
    [regionFilter],
  );

  const villageOptions = useMemo(
    () => (districtFilter === "all" ? [] : getVillagesForDistrict(districtFilter)),
    [districtFilter],
  );

  const villageDisabled = districtFilter === "all" || villageOptions.length === 0;

  const villagePlaceholder =
    districtFilter === "all"
      ? t("farmersPage.filters.selectDistrictFirst")
      : villageOptions.length === 0
        ? t("farmersPage.filters.noVillages")
        : t("farmersPage.filters.allVillages");

  // Reset child filters when parent options no longer include current selection
  useEffect(() => {
    if (regionFilter !== "all" && districtFilter !== "all" && !districtOptions.includes(districtFilter)) {
      setDistrictFilter("all");
      setVillageFilter("all");
    }
  }, [districtFilter, districtOptions, regionFilter]);

  useEffect(() => {
    if (villageFilter !== "all" && !villageOptions.some((v) => villagesMatch(v, villageFilter))) {
      setVillageFilter("all");
    }
  }, [villageFilter, villageOptions]);

  const filteredFarmers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allFarmers.filter((farmer) => {
      const matchesSearch =
        !query ||
        farmer.name.toLowerCase().includes(query) ||
        farmer.location.toLowerCase().includes(query) ||
        farmer.districtCity.toLowerCase().includes(query) ||
        farmer.economicRegion.toLowerCase().includes(query) ||
        farmer.category.toLowerCase().includes(query) ||
        (farmer.village?.toLowerCase().includes(query) ?? false) ||
        farmer.specialties.some((item) => item.toLowerCase().includes(query));

      const matchesCategory = categoryFilter === "all" || farmer.category === categoryFilter;
      const matchesRegion = regionFilter === "all" || farmer.economicRegion === regionFilter;
      const matchesDistrict = districtFilter === "all" || farmer.districtCity === districtFilter;
      const matchesVillage =
        villageFilter === "all" ||
        (farmer.village ? villagesMatch(farmer.village, villageFilter) : false);

      return matchesSearch && matchesCategory && matchesRegion && matchesDistrict && matchesVillage;
    });
  }, [categoryFilter, districtFilter, regionFilter, searchTerm, villageFilter]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (regionFilter !== "all") {
      chips.push({
        key: "region",
        label: regionFilter,
        onRemove: () => {
          setRegionFilter("all");
          setDistrictFilter("all");
          setVillageFilter("all");
        },
      });
    }

    if (districtFilter !== "all") {
      chips.push({
        key: "district",
        label: districtFilter,
        onRemove: () => {
          setDistrictFilter("all");
          setVillageFilter("all");
        },
      });
    }

    if (villageFilter !== "all") {
      chips.push({
        key: "village",
        label: villageFilter,
        onRemove: () => setVillageFilter("all"),
      });
    }

    if (categoryFilter !== "all") {
      chips.push({
        key: "category",
        label: formatCategoryChip(t, categoryFilter),
        onRemove: () => setCategoryFilter("all"),
      });
    }

    if (searchTerm.trim()) {
      chips.push({
        key: "search",
        label: formatSearchChip(t, searchTerm.trim()),
        onRemove: () => setSearchTerm(""),
      });
    }

    return chips;
  }, [categoryFilter, districtFilter, regionFilter, searchTerm, t, villageFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("all");
    setRegionFilter("all");
    setDistrictFilter("all");
    setVillageFilter("all");
  }, []);

  const handleRegionChange = (region: EconomicRegion | "all") => {
    setRegionFilter(region);
    setDistrictFilter("all");
    setVillageFilter("all");
  };

  const handleDistrictChange = (district: string) => {
    setDistrictFilter(district);
    setVillageFilter("all");
    if (district !== "all") {
      const region = getRegionForDistrict(district);
      if (region) {
        setRegionFilter(region);
      }
    }
  };

  const goToFarmerProfile = (slug: string) => {
    navigateToHash(`farmers/${slug}`);
  };

  const hasActiveFilters =
    regionFilter !== "all" ||
    districtFilter !== "all" ||
    villageFilter !== "all" ||
    categoryFilter !== "all" ||
    Boolean(searchTerm.trim());

  return (
    <div className="agrivo-shell agrivo-farmers-directory min-h-screen overflow-x-hidden">
      <AgrivoNavbar activeItem="farmers" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <section className="border-b border-[#e5efe1] bg-[linear-gradient(135deg,#F6FBF4_0%,#EEF8EE_55%,#FFFFFF_100%)]">
        <div className="agrivo-container py-6 sm:py-8 lg:py-10">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1.15fr)] lg:gap-10 xl:gap-12">
            <div className="min-w-0">
              <motion.div
                initial="hidden"
                animate="show"
                variants={reveal}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="agrivo-farmers-eyebrow mb-3 uppercase text-[#15803d]">
                  {t("farmersPage.eyebrow")}
                </p>
                <h1 className="agrivo-heading agrivo-farmers-title text-[#102018]">
                  {t("farmersPage.title")}
                </h1>
                <p className="agrivo-farmers-subtitle mt-4 max-w-2xl text-[#5F6F64]">
                  {t("farmersPage.subtitle")}
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={reveal}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 rounded-[28px] border border-[#DEECE0] bg-white p-5 shadow-[0_18px_50px_rgba(20,83,45,0.08)] sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative sm:col-span-2">
                    <Search className="absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#6F7F74]" />
                    <Input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder={t("farmersPage.searchPlaceholder")}
                      aria-label={t("farmersPage.searchPlaceholder")}
                      className="agrivo-filter-control h-14 rounded-full border-0 bg-[#F7FBF5] pl-12 text-[#102018] placeholder:text-[#97A59B] focus-visible:ring-1 focus-visible:ring-[#43A047]"
                    />
                  </div>

                  <FilterField label={t("farmersPage.filters.economicRegion")}>
                    <Select
                      value={regionFilter}
                      onValueChange={(value) => handleRegionChange(value as EconomicRegion | "all")}
                    >
                      <SelectTrigger className={filterTriggerClass}>
                        <SelectValue placeholder={t("farmersPage.filters.allEconomicRegions")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-base">
                          {t("farmersPage.filters.allEconomicRegions")}
                        </SelectItem>
                        {economicRegions.map((region) => (
                          <SelectItem key={region} value={region} className="text-base">
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label={t("farmersPage.filters.districtCity")}>
                    <Select
                      value={districtFilter}
                      onValueChange={handleDistrictChange}
                      disabled={regionFilter === "all"}
                    >
                      <SelectTrigger className={filterTriggerClass} disabled={regionFilter === "all"}>
                        <SelectValue
                          placeholder={
                            regionFilter === "all"
                              ? t("farmersPage.filters.selectRegionFirst")
                              : t("farmersPage.filters.allDistrictsCities")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-base">
                          {t("farmersPage.filters.allDistrictsCities")}
                        </SelectItem>
                        {districtOptions.map((district) => (
                          <SelectItem key={district} value={district} className="text-base">
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label={t("farmersPage.filters.village")}>
                    <Select
                      value={villageDisabled ? undefined : villageFilter}
                      onValueChange={setVillageFilter}
                      disabled={villageDisabled}
                    >
                      <SelectTrigger className={filterTriggerClass} disabled={villageDisabled}>
                        <SelectValue placeholder={villagePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-base">
                          {t("farmersPage.filters.allVillages")}
                        </SelectItem>
                        {villageOptions.map((village) => (
                          <SelectItem key={village} value={village} className="text-base">
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>

                  <FilterField label={t("farmersPage.filters.category")}>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className={filterTriggerClass}>
                        <SelectValue placeholder={t("farmersPage.filters.allCategories")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-base">
                          {t("farmersPage.filters.allCategories")}
                        </SelectItem>
                        {farmerCategories.map((category) => (
                          <SelectItem key={category} value={category} className="text-base">
                            {translateFarmerCategory(t, category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FilterField>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {activeChips.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeChips.map((chip) => (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={chip.onRemove}
                          className="agrivo-farmers-chip inline-flex items-center gap-2 rounded-full bg-[#EAF7EC] px-4 py-2 font-medium text-[#14532D] transition hover:bg-[#D5F4D9]"
                        >
                          {chip.label}
                          <X className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  )}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="agrivo-farmers-clear font-medium text-[#14532D] underline-offset-4 transition hover:underline"
                    >
                      {t("farmersPage.clearFilters")}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="min-w-0 lg:sticky lg:top-24">
              <AzerbaijanMap selectedRegion={regionFilter} onRegionSelect={handleRegionChange} />
            </div>
          </div>
        </div>
      </section>

      <section className="agrivo-section pt-6 sm:pt-8">
        <div className="agrivo-container">
          <motion.p
            key={`${filteredFarmers.length}-${regionFilter}-${districtFilter}-${villageFilter}-${categoryFilter}-${searchTerm}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="agrivo-farmers-results text-[#5F6F64]"
          >
            {formatShowingFarmers(t, filteredFarmers.length, allFarmers.length)}
          </motion.p>

          <AnimatePresence mode="popLayout">
            {filteredFarmers.length > 0 ? (
              <motion.div
                key={`grid-${regionFilter}-${districtFilter}-${villageFilter}-${categoryFilter}-${searchTerm}`}
                initial="hidden"
                animate="show"
                className="agrivo-farmer-grid agrivo-farmer-grid--directory mt-6"
              >
                {filteredFarmers.map((farmer, index) => (
                  <motion.div
                    key={farmer.slug}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    layout
                  >
                    <FeaturedFarmerCard farmer={farmer} onViewProfile={goToFarmerProfile} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 rounded-[28px] border border-[#e5efe1] bg-white px-6 py-14 text-center"
              >
                <h2 className="text-2xl font-semibold text-[#102018] sm:text-[1.75rem]">
                  {t("farmersPage.results.emptyTitle")}
                </h2>
                <p className="agrivo-farmers-subtitle mt-3 text-[#5F6F64]">
                  {t("farmersPage.results.emptyDesc")}
                </p>
                <Button
                  className="mt-6 rounded-full bg-[#14532D] px-6 py-6 text-base text-white hover:bg-[#1D6A3B]"
                  onClick={clearFilters}
                >
                  {t("farmersPage.clearFilters")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
