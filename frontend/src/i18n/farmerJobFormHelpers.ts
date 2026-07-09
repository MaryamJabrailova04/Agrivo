import type { Language } from "./translations";
import type { TranslateFn } from "./LanguageContext";

export const JOB_TYPE_KEYS = [
  "harvesting",
  "picking",
  "greenhouseWork",
  "farmHelper",
  "packing",
  "loading",
  "planting",
] as const;

export const CROP_TYPE_KEYS = [
  "cherry",
  "apple",
  "tomato",
  "hazelnut",
  "grape",
  "cucumber",
  "potato",
  "pomegranate",
  "watermelon",
  "pepper",
] as const;

export type JobTypeKey = (typeof JOB_TYPE_KEYS)[number];
export type CropTypeKey = (typeof CROP_TYPE_KEYS)[number];

const LEGACY_JOB_TYPE_TO_KEY: Record<string, JobTypeKey> = {
  harvesting: "harvesting",
  picking: "picking",
  packing: "packing",
  planting: "planting",
  greenhousework: "greenhouseWork",
  "greenhouse work": "greenhouseWork",
  loading: "loading",
  farmhelper: "farmHelper",
  "farm helper": "farmHelper",
};

const LEGACY_CROP_TYPE_TO_KEY: Record<string, CropTypeKey> = {
  cherry: "cherry",
  apple: "apple",
  tomato: "tomato",
  grape: "grape",
  hazelnut: "hazelnut",
  potato: "potato",
  cucumber: "cucumber",
  pepper: "pepper",
  pomegranate: "pomegranate",
  watermelon: "watermelon",
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function normalizeJobTypeKey(value: string): JobTypeKey | null {
  const trimmed = value.trim();
  if ((JOB_TYPE_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as JobTypeKey;
  }
  const normalized = normalizeKey(trimmed);
  return LEGACY_JOB_TYPE_TO_KEY[normalized] ?? null;
}

export function normalizeCropTypeKey(value: string): CropTypeKey | null {
  const trimmed = value.trim();
  if ((CROP_TYPE_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as CropTypeKey;
  }
  const normalized = normalizeKey(trimmed);
  return LEGACY_CROP_TYPE_TO_KEY[normalized] ?? null;
}

export function getLocalizedJobType(
  typeKeyOrLegacy: string,
  _language: Language,
  t: TranslateFn,
): string {
  const key = normalizeJobTypeKey(typeKeyOrLegacy);
  if (key) return t(`createJob.jobTypes.${key}`);
  return typeKeyOrLegacy;
}

export function getLocalizedCrop(
  cropKeyOrLegacy: string,
  _language: Language,
  t: TranslateFn,
): string {
  const key = normalizeCropTypeKey(cropKeyOrLegacy);
  if (key) return t(`createJob.cropTypes.${key}`);
  return cropKeyOrLegacy;
}

export function translateJobPostStatus(t: TranslateFn, status: string): string {
  if (status === "active") return t("createJob.status.active");
  if (status === "draft") return t("createJob.status.draft");
  if (status === "closed") return t("createJob.status.closed");
  return status;
}
