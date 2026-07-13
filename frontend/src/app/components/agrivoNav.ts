import { navigateToHash } from "../../i18n/localizedRoutes";

export const AGRIVO_HEADER_SCROLL_OFFSET = 88;
export const SCROLL_SECTION_KEY = "agrivoScrollSection";

export type AgrivoNavKind = "home" | "page" | "section";

export type AgrivoNavItem = {
  labelKey: string;
  kind: AgrivoNavKind;
  target: string;
};

/** Primary public navigation (shared by desktop + mobile). */
export const agrivoMainNavItems: AgrivoNavItem[] = [
  { labelKey: "nav.home", kind: "home", target: "top" },
  { labelKey: "nav.marketplace", kind: "page", target: "products" },
  { labelKey: "nav.farmers", kind: "page", target: "farmers" },
  { labelKey: "nav.farmJobs", kind: "page", target: "jobs" },
  { labelKey: "nav.logistics", kind: "page", target: "logistics" },
];

/** Desktop center nav historically included Login as a text link. */
export const agrivoNavigationItems: AgrivoNavItem[] = [
  ...agrivoMainNavItems,
  { labelKey: "nav.login", kind: "page", target: "login" },
];

export type AgrivoNavActive = "home" | "marketplace" | "farmers" | "jobs" | "logistics";

export function isNavItemActive(item: AgrivoNavItem, activeItem?: AgrivoNavActive) {
  if (!activeItem) return false;
  if (activeItem === "home" && item.kind === "home") return true;
  if (activeItem === "marketplace" && item.target === "products") return true;
  if (activeItem === "farmers" && item.target === "farmers") return true;
  if (activeItem === "jobs" && item.target === "jobs") return true;
  if (activeItem === "logistics" && item.target === "logistics") return true;
  return false;
}

export function navigateAgrivo(kind: AgrivoNavKind, target: string) {
  if (kind === "page") {
    navigateToHash(target);
    return;
  }

  if (kind === "section") {
    sessionStorage.setItem(SCROLL_SECTION_KEY, target);
    navigateToHash("home");
    return;
  }

  navigateToHash("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function consumePendingSectionScroll(offset = AGRIVO_HEADER_SCROLL_OFFSET) {
  const sectionId = sessionStorage.getItem(SCROLL_SECTION_KEY);
  if (!sectionId) return;

  sessionStorage.removeItem(SCROLL_SECTION_KEY);
  const section = document.getElementById(sectionId);
  if (!section) return;

  const top = section.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
