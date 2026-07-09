import { SCROLL_SECTION_KEY } from "../components/AgrivoNavbar";
import { getRoutePathFromHash } from "../../i18n/localizedRoutes";
import { getRouteKey, resolveHashRoute } from "../routing/hashRoutes";

const SCROLL_CONTAINER_SELECTORS = ["#root", "main", ".agrivo-shell"] as const;

export function shouldSkipScrollToTop(routeKey: string): boolean {
  const pendingSection = sessionStorage.getItem(SCROLL_SECTION_KEY);
  return Boolean(pendingSection && routeKey === "home");
}

export function getCurrentRouteKey(): string {
  const path = getRoutePathFromHash();
  return getRouteKey(resolveHashRoute(path));
}

/**
 * Resets scroll on window, document roots, and known app containers.
 */
export function resetAppScroll(): void {
  const html = document.documentElement;
  const previousScrollBehavior = html.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  html.scrollTop = 0;
  document.body.scrollTop = 0;

  for (const selector of SCROLL_CONTAINER_SELECTORS) {
    document.querySelectorAll(selector).forEach((node) => {
      if (node instanceof HTMLElement) {
        node.scrollTop = 0;
        node.scrollLeft = 0;
      }
    });
  }

  html.style.scrollBehavior = previousScrollBehavior;
}

export function disableBrowserScrollRestoration(): void {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}

export function scrollToTopForRoute(routeKey: string): void {
  if (shouldSkipScrollToTop(routeKey)) {
    return;
  }

  resetAppScroll();
}

export function scrollToTopForCurrentRoute(): void {
  scrollToTopForRoute(getCurrentRouteKey());
}
