import { navigateToHash } from "../../i18n/localizedRoutes";
import type { FarmJob } from "../data/farmJobs";
import { getFarmerBySlug, getFarmerByName, type FarmerProfile } from "../data/farmers";

export function resolveFarmerForJob(job: FarmJob): FarmerProfile | null {
  if (job.farmerSlug) {
    return getFarmerBySlug(job.farmerSlug) ?? null;
  }
  return getFarmerByName(job.farmerName) ?? null;
}

export function getFarmerProfileUrl(slug: string): string {
  return `#farmers/${slug}`;
}

export function navigateToFarmerProfile(slug: string): void {
  navigateToHash(`farmers/${slug}`);
}
