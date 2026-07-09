import type { FarmJob } from "../app/data/farmJobs";
import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";
import {
  getLocalizedCrop,
  getLocalizedJobType,
  normalizeCropTypeKey,
  normalizeJobTypeKey,
} from "./farmerJobFormHelpers";

const JOB_TITLE_KEYS: Record<string, string> = {
  "cherry-harvest-quba": "jobs.page.mockJobs.cherryHarvest",
  "apple-picking-quba": "jobs.page.mockJobs.applePicking",
  "tomato-greenhouse-lankaran": "jobs.page.mockJobs.tomatoGreenhouse",
  "hazelnut-harvest-sheki": "jobs.page.mockJobs.hazelnutCollection",
  "grape-harvest-tovuz": "jobs.page.mockJobs.grapeHarvest",
  "Cherry Harvest Workers Needed": "jobs.page.mockJobs.cherryHarvest",
  "Apple Picking Workers": "jobs.page.mockJobs.applePicking",
  "Tomato Greenhouse Helper": "jobs.page.mockJobs.tomatoGreenhouse",
  "Hazelnut Collection Workers": "jobs.page.mockJobs.hazelnutCollection",
  "Grape Harvest Team": "jobs.page.mockJobs.grapeHarvest",
};

const JOB_TYPE_KEYS: Record<string, string> = {
  Harvesting: "jobs.page.tags.harvesting",
  Picking: "jobs.page.tags.picking",
  Packing: "jobs.page.jobTypes.packing",
  Planting: "jobs.page.jobTypes.planting",
  "Greenhouse Work": "jobs.page.tags.greenhouseWork",
  Loading: "jobs.page.jobTypes.loading",
  "Farm Helper": "jobs.page.jobTypes.farmHelper",
};

const CROP_TYPE_KEYS: Record<string, string> = {
  Cherry: "jobs.page.tags.cherry",
  Apple: "jobs.page.tags.apple",
  Tomato: "jobs.page.tags.tomato",
  Grape: "jobs.page.tags.grape",
  Hazelnut: "jobs.page.tags.hazelnut",
  Potato: "jobs.page.tags.potato",
  Cucumber: "jobs.page.tags.cucumber",
  Pepper: "jobs.page.tags.pepper",
};

const BENEFIT_TAG_KEYS: Record<string, string> = {
  "No experience needed": "jobs.page.tags.noExperienceNeeded",
  "No experience required": "jobs.page.tags.noExperienceNeeded",
  "Experienced preferred": "jobs.page.tags.experiencedPreferred",
  "Meals included": "jobs.page.tags.mealsIncluded",
  "Transport included": "jobs.page.tags.transportIncluded",
  "Housing included": "jobs.page.tags.housingIncluded",
  "Housing optional": "jobs.page.tags.housingOptional",
  "Equipment provided": "jobs.page.tags.equipmentProvided",
  Urgent: "jobs.page.tags.urgent",
};

const LOCATION_KEYS: Record<string, string> = {
  "Quba, Alpan village": "jobs.page.locations.qubaAlpan",
  "Quba, Qırmızı Qəsəbə": "jobs.page.locations.qubaQirmiziQesebe",
  "Lənkəran, Seyidəkəran village": "jobs.page.locations.lankaranSeyidakeran",
  "Şəki, Aydınbulaq village": "jobs.page.locations.shekiAydinbulaq",
  Tovuz: "jobs.page.locations.tovuz",
};

const DESCRIPTION_SLUG_KEYS: Record<string, string> = {
  "cherry-harvest-quba": "farmJobDetail.descriptions.cherryHarvest",
  "apple-picking-quba": "farmJobDetail.descriptions.applePicking",
  "tomato-greenhouse-lankaran": "farmJobDetail.descriptions.tomatoGreenhouse",
  "hazelnut-harvest-sheki": "farmJobDetail.descriptions.hazelnutCollection",
  "grape-harvest-tovuz": "farmJobDetail.descriptions.grapeHarvest",
};

const REQUIREMENT_KEYS: Record<string, string> = {
  "No experience required": "farmJobDetail.requirements.noExperience",
  "Able to work outdoors": "farmJobDetail.requirements.outdoors",
  "Must arrive on time": "farmJobDetail.requirements.onTime",
  "Comfortable working with fruit harvesting": "farmJobDetail.requirements.fruitHarvesting",
  "Careful handling of apples": "farmJobDetail.requirements.carefulApples",
  "Greenhouse experience preferred": "farmJobDetail.requirements.greenhouseExperience",
  "Physical stamina for field work": "farmJobDetail.requirements.physicalStamina",
  "Able to stand for long periods": "farmJobDetail.requirements.standLongPeriods",
  "Reliable attendance": "farmJobDetail.requirements.reliableAttendance",
  "Comfortable working on slopes": "farmJobDetail.requirements.slopes",
  "Team-oriented attitude": "farmJobDetail.requirements.teamOriented",
  "Harvest experience preferred": "farmJobDetail.requirements.harvestExperience",
  "Early morning availability": "farmJobDetail.requirements.earlyMorning",
  "Able to work in vineyard rows": "farmJobDetail.requirements.vineyardRows",
};

const INCLUDED_KEYS: Record<string, string> = {
  ...BENEFIT_TAG_KEYS,
};

const DATE_FILTER_KEYS: Record<string, string> = {
  "this-week": "jobs.page.filters.thisWeek",
  "this-month": "jobs.page.filters.thisMonth",
  upcoming: "jobs.page.filters.upcoming",
};

function lookup(t: TranslateFn, map: Record<string, string>, value: string): string {
  const key = map[value];
  return key ? t(key, value) : value;
}

export function translateJobTitle(t: TranslateFn, job: FarmJob): string {
  const bySlug = JOB_TITLE_KEYS[job.slug];
  if (bySlug) return t(bySlug, job.title);
  return lookup(t, JOB_TITLE_KEYS, job.title);
}

export function translateJobType(t: TranslateFn, jobType: string): string {
  if (normalizeJobTypeKey(jobType)) {
    return getLocalizedJobType(jobType, "en", t);
  }
  return lookup(t, JOB_TYPE_KEYS, jobType);
}

export function translateCropType(t: TranslateFn, cropType: string): string {
  if (normalizeCropTypeKey(cropType)) {
    return getLocalizedCrop(cropType, "en", t);
  }
  return lookup(t, CROP_TYPE_KEYS, cropType);
}

export function translateJobBenefitTag(t: TranslateFn, tag: string): string {
  return lookup(t, BENEFIT_TAG_KEYS, tag);
}

export function translateJobLocation(t: TranslateFn, location: string): string {
  return lookup(t, LOCATION_KEYS, location);
}

export function translateDateFilterLabel(t: TranslateFn, dateRange: string): string {
  if (dateRange === "any") return t("jobs.page.filters.anyDate");
  return lookup(t, DATE_FILTER_KEYS, dateRange);
}

export function formatJobsAvailable(t: TranslateFn, count: number): string {
  const key = count === 1 ? "jobs.page.results.jobAvailable" : "jobs.page.results.jobsAvailable";
  return t(key).replace("{count}", String(count));
}

export function formatWorkersNeeded(t: TranslateFn, count: number): string {
  const key = count === 1 ? "jobs.page.card.workerNeeded" : "jobs.page.card.workersNeeded";
  return t(key).replace("{count}", String(count));
}

export function formatJobPay(t: TranslateFn, dailyPay: number): string {
  return t("jobs.page.card.payPerDay").replace("{amount}", String(dailyPay));
}

export function formatSearchChip(t: TranslateFn, term: string): string {
  return t("jobs.page.results.searchChip").replace("{term}", term);
}

export function formatSignedInAs(t: TranslateFn, name: string): string {
  return t("jobs.page.results.signedInAs").replace("{name}", name);
}

export function formatLocalizedJobDateRange(
  language: Language,
  startDate: string,
  endDate: string,
): string {
  const locale = language === "az" ? "az-AZ" : "en-US";
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (language === "az") {
    const month = start.toLocaleDateString(locale, { month: "long" });
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${month}`;
    }
    const endMonth = end.toLocaleDateString(locale, { month: "long" });
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} ${month}`;
    }
    return `${start.getDate()} ${month} – ${end.getDate()} ${endMonth}`;
  }

  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString(locale, { month: "long" })} ${start.getDate()} – ${end.getDate()}`;
    }
    return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, yearOpts)}`;
  }

  return `${start.toLocaleDateString(locale, yearOpts)} – ${end.toLocaleDateString(locale, yearOpts)}`;
}

export function getLocalizedBenefitTags(t: TranslateFn, tags: string[]): string[] {
  return tags.map((tag) => translateJobBenefitTag(t, tag));
}

export function translateJobDescription(t: TranslateFn, job: FarmJob): string {
  const bySlug = DESCRIPTION_SLUG_KEYS[job.slug];
  if (bySlug) return t(bySlug, job.description);
  return job.description;
}

export function translateJobRequirement(t: TranslateFn, requirement: string): string {
  return lookup(t, REQUIREMENT_KEYS, requirement);
}

export function translateJobIncludedItem(t: TranslateFn, item: string): string {
  return lookup(t, INCLUDED_KEYS, item);
}

export function formatJobWorkersPeople(t: TranslateFn, count: number): string {
  const key = count === 1 ? "farmJobDetail.stats.person" : "farmJobDetail.stats.people";
  return t(key).replace("{count}", String(count));
}

export function formatPostedAgo(t: TranslateFn, language: Language, isoDate?: string): string | null {
  if (!isoDate) return null;
  const posted = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return t("farmJobDetail.posted.today");
  if (days === 1) return t("farmJobDetail.posted.yesterday");
  if (days < 7) return t("farmJobDetail.posted.daysAgo").replace("{count}", String(days));
  if (days < 30) return t("farmJobDetail.posted.weeksAgo").replace("{count}", String(Math.floor(days / 7)));

  const locale = language === "az" ? "az-AZ" : "en-US";
  const date = posted.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  return t("farmJobDetail.posted.onDate").replace("{date}", date);
}
