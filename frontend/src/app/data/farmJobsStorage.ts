import { getAuthUser } from "../auth/authStorage";
import { getFarmerByName } from "./farmers";
import {
  normalizeCropTypeKey,
  normalizeJobTypeKey,
} from "../../i18n/farmerJobFormHelpers";
import {
  mockFarmJobs,
  slugifyJobTitle,
  type FarmJob,
  type JobType,
  type CropType,
} from "./farmJobs";
import type { EconomicRegion } from "./azerbaijanRegions";

const STORAGE_KEY = "agrivo_farmer_jobs";

function readStoredJobs(): FarmJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FarmJob[];
  } catch {
    return [];
  }
}

function writeStoredJobs(jobs: FarmJob[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function getAllFarmJobs(): FarmJob[] {
  const stored = readStoredJobs();
  const mockIds = new Set(mockFarmJobs.map((j) => j.id));
  const uniqueStored = stored.filter((j) => !mockIds.has(j.id));
  return [...mockFarmJobs, ...uniqueStored];
}

export function getFarmerJobs(email?: string): FarmJob[] {
  const userEmail = email ?? getAuthUser()?.email;
  if (!userEmail) return [];
  return getAllFarmJobs().filter((job) => job.ownerEmail === userEmail);
}

export function getJobsByFarmerSlug(farmerSlug: string): FarmJob[] {
  return getAllFarmJobs().filter(
    (job) => job.farmerSlug === farmerSlug && job.status === "active",
  );
}

export function getJobBySlugFromAll(slug: string): FarmJob | undefined {
  return getAllFarmJobs().find((job) => job.slug === slug);
}

export function getFarmerJobById(jobId: string): FarmJob | undefined {
  const user = getAuthUser();
  const job = getAllFarmJobs().find((j) => j.id === jobId);
  if (!job || job.isMock) return undefined;
  if (user && job.ownerEmail !== user.email) return undefined;
  return job;
}

export interface CreateJobInput {
  title: string;
  jobType: string;
  cropType: string;
  description: string;
  economicRegion: EconomicRegion;
  district: string;
  village: string;
  exactLocation: string;
  startDate: string;
  endDate: string;
  workersNeeded: number;
  dailyPay: number;
  workingHours: string;
  phone: string;
  experienceRequired: boolean;
  mealsIncluded: boolean;
  transportIncluded: boolean;
  housingIncluded: boolean;
  equipmentProvided: boolean;
  urgent: boolean;
  status: "active" | "closed";
}

export function createFarmerJob(input: CreateJobInput): FarmJob {
  const user = getAuthUser();
  const id = `job-user-${Date.now()}`;
  let slug = slugifyJobTitle(input.title);
  const existing = getAllFarmJobs();
  if (existing.some((j) => j.slug === slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const locationParts = [input.district, input.village].filter(Boolean);
  const location = locationParts.join(", ");

  const included: string[] = [];
  if (input.mealsIncluded) included.push("Meals included");
  if (input.transportIncluded) included.push("Transport included");
  if (input.housingIncluded) included.push("Housing included");
  if (input.equipmentProvided) included.push("Equipment provided");

  const linkedFarmer = user?.name ? getFarmerByName(user.name) : null;
  const jobType = normalizeJobTypeKey(input.jobType) ?? input.jobType;
  const cropType = normalizeCropTypeKey(input.cropType) ?? input.cropType;

  const job: FarmJob = {
    id,
    slug,
    title: input.title,
    farmerName: user?.name ?? "Verified Farmer",
    farmerSlug: linkedFarmer?.slug,
    farmerVerified: true,
    location: input.exactLocation || location,
    district: input.district,
    village: input.village,
    economicRegion: input.economicRegion,
    exactLocation: input.exactLocation,
    jobType: jobType as JobType,
    cropType: cropType as CropType,
    workersNeeded: input.workersNeeded,
    dailyPay: input.dailyPay,
    startDate: input.startDate,
    endDate: input.endDate,
    workingHours: input.workingHours,
    benefits: {
      mealsIncluded: input.mealsIncluded,
      transportIncluded: input.transportIncluded,
      housingIncluded: input.housingIncluded,
      equipmentProvided: input.equipmentProvided,
    },
    experienceRequired: input.experienceRequired,
    experienceLabel: input.experienceRequired ? "Experienced preferred" : "No experience required",
    requirements: input.experienceRequired
      ? ["Experience preferred", "Able to work outdoors", "Must arrive on time"]
      : ["No experience required", "Able to work outdoors", "Must arrive on time"],
    included,
    description: input.description,
    phone: input.phone,
    whatsapp: input.phone,
    status: input.status,
    urgent: input.urgent,
    applicantsCount: 0,
    postedAt: new Date().toISOString().slice(0, 10),
    ownerEmail: user?.email,
    isMock: false,
  };

  const stored = readStoredJobs();
  stored.push(job);
  writeStoredJobs(stored);
  return job;
}

export function updateJobStatus(jobId: string, status: "active" | "closed"): boolean {
  const stored = readStoredJobs();
  const index = stored.findIndex((j) => j.id === jobId);
  if (index === -1) return false;
  stored[index] = { ...stored[index], status };
  writeStoredJobs(stored);
  return true;
}

export function deleteFarmerJob(jobId: string): boolean {
  const user = getAuthUser();
  const stored = readStoredJobs();
  const job = stored.find((j) => j.id === jobId);
  if (!job || (user && job.ownerEmail !== user.email)) return false;
  writeStoredJobs(stored.filter((j) => j.id !== jobId));
  return true;
}

export function updateFarmerJob(jobId: string, input: Partial<CreateJobInput>): boolean {
  const user = getAuthUser();
  const stored = readStoredJobs();
  const index = stored.findIndex((j) => j.id === jobId);
  if (index === -1) return false;
  const existing = stored[index];
  if (user && existing.ownerEmail !== user.email) return false;

  const jobType = input.jobType
    ? (normalizeJobTypeKey(input.jobType) ?? input.jobType)
    : existing.jobType;
  const cropType = input.cropType
    ? (normalizeCropTypeKey(input.cropType) ?? input.cropType)
    : existing.cropType;

  const updated: FarmJob = {
    ...existing,
    title: input.title ?? existing.title,
    jobType: jobType as JobType,
    cropType: cropType as CropType,
    description: input.description ?? existing.description,
    economicRegion: input.economicRegion ?? existing.economicRegion,
    district: input.district ?? existing.district,
    village: input.village ?? existing.village,
    exactLocation: input.exactLocation ?? existing.exactLocation,
    location: input.exactLocation ?? [input.district ?? existing.district, input.village ?? existing.village].filter(Boolean).join(", "),
    startDate: input.startDate ?? existing.startDate,
    endDate: input.endDate ?? existing.endDate,
    workersNeeded: input.workersNeeded ?? existing.workersNeeded,
    dailyPay: input.dailyPay ?? existing.dailyPay,
    workingHours: input.workingHours ?? existing.workingHours,
    phone: input.phone ?? existing.phone,
    whatsapp: input.phone ?? existing.whatsapp,
    experienceRequired: input.experienceRequired ?? existing.experienceRequired,
    experienceLabel:
      (input.experienceRequired ?? existing.experienceRequired) ? "Experienced preferred" : "No experience required",
    benefits: {
      mealsIncluded: input.mealsIncluded ?? existing.benefits.mealsIncluded,
      transportIncluded: input.transportIncluded ?? existing.benefits.transportIncluded,
      housingIncluded: input.housingIncluded ?? existing.benefits.housingIncluded,
      equipmentProvided: input.equipmentProvided ?? existing.benefits.equipmentProvided,
    },
    status: input.status ?? existing.status,
    urgent: input.urgent ?? existing.urgent,
  };

  stored[index] = updated;
  writeStoredJobs(stored);
  return true;
}
