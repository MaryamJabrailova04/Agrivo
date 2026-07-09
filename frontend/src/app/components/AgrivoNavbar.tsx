import { useEffect, useState } from "react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { LogOut, Menu, UserRound } from "lucide-react";
import { motion } from "motion/react";
import agrivoLogo from "../../assets/agrivo-logo.png";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";

export const AGRIVO_HEADER_SCROLL_OFFSET = 88;
export const SCROLL_SECTION_KEY = "agrivoScrollSection";

export const agrivoNavigationItems = [
  { labelKey: "nav.home", kind: "home" as const, target: "top" },
  { labelKey: "nav.marketplace", kind: "page" as const, target: "products" },
  { labelKey: "nav.farmers", kind: "page" as const, target: "farmers" },
  { labelKey: "nav.farmJobs", kind: "page" as const, target: "jobs" },
  { labelKey: "nav.logistics", kind: "page" as const, target: "logistics" },
  { labelKey: "nav.login", kind: "page" as const, target: "login" },
];

export type AgrivoNavActive = "home" | "marketplace" | "farmers" | "jobs" | "logistics";

function isNavItemActive(item: (typeof agrivoNavigationItems)[number], activeItem?: AgrivoNavActive) {
  if (!activeItem) return false;
  if (activeItem === "home" && item.kind === "home") return true;
  if (activeItem === "marketplace" && item.target === "products") return true;
  if (activeItem === "farmers" && item.target === "farmers") return true;
  if (activeItem === "jobs" && item.target === "jobs") return true;
  if (activeItem === "logistics" && item.target === "logistics") return true;
  return false;
}

export function navigateAgrivo(kind: "home" | "page" | "section", target: string) {
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

interface AgrivoNavbarProps {
  activeItem?: AgrivoNavActive;
  animateOnMount?: boolean;
}

export function AgrivoNavbar({ activeItem, animateOnMount = false }: AgrivoNavbarProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const { t } = useLanguage();

  const visibleNavItems = agrivoNavigationItems.filter(
    (item) => !(isAuthenticated && item.target === "login"),
  );

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const HeaderTag = motion.header;

  return (
    <HeaderTag
      className={cn("agrivo-header", headerScrolled && "agrivo-header--scrolled")}
      initial={animateOnMount ? { opacity: 0, y: -24 } : false}
      animate={animateOnMount ? { opacity: 1, y: 0 } : undefined}
      transition={animateOnMount ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] } : undefined}
    >
      <div className="agrivo-container">
        <div className="agrivo-header-inner">
          <button
            type="button"
            className="navbar-logo"
            onClick={() => navigateAgrivo("home", "top")}
            aria-label="Agrivo home"
          >
            <img src={agrivoLogo} alt="Agrivo" />
          </button>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1">
            {visibleNavItems.map((item) => {
              const isActive = isNavItemActive(item, activeItem);
              return (
                <button
                  key={item.labelKey}
                  type="button"
                  className={cn(
                    "agrivo-nav-link",
                    isActive &&
                      "bg-[#EAF7EC] text-[#14532D] shadow-[inset_0_0_0_1px_rgba(20,83,45,0.06)]",
                    !isActive && "text-[#34473C]",
                  )}
                  onClick={() => navigateAgrivo(item.kind, item.target)}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <LanguageSwitcher variant="compact" />
            {isAuthenticated && user ? (
              <>
                <div className="inline-flex max-w-[10rem] items-center gap-2 rounded-full border border-[#dbe7d4] bg-white px-3 py-1.5 text-xs font-medium text-[#102018] xl:max-w-[12rem]">
                  <UserRound className="h-3.5 w-3.5 shrink-0 text-[#43A047]" />
                  <span className="truncate">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] px-4 text-sm text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={() => navigateAgrivo("page", getDashboardRoute())}
                >
                  {t("nav.dashboard")}
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-3 text-sm text-[#5F6F64] hover:bg-[#fef2f2] hover:text-[#b91c1c]"
                  onClick={() => {
                    logout();
                    navigateToHash("home");
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="agrivo-button-soft rounded-full bg-[#14532D] px-5 text-sm text-white hover:bg-[#1D6A3B] xl:px-6"
                  onClick={() => navigateAgrivo("page", "login")}
                >
                  {t("nav.getStarted")}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSwitcher variant="compact" />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-[#14532D] hover:bg-[#EAF7EC] hover:text-[#14532D]"
                  aria-label={t("nav.openMenu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)] bg-[#F6FBF4]">
                <div className="mt-8 flex flex-col gap-3">
                  {visibleNavItems.map((item) => {
                    const isActive = isNavItemActive(item, activeItem);
                    return (
                      <button
                        key={item.labelKey}
                        type="button"
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left text-sm font-medium",
                          isActive
                            ? "bg-[#EAF7EC] text-[#14532D]"
                            : "border border-[#dbe7d4] bg-white text-[#102018]",
                        )}
                        onClick={() => navigateAgrivo(item.kind, item.target)}
                      >
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
                  {isAuthenticated && user ? (
                    <>
                      <div className="rounded-2xl border border-[#dbe7d4] bg-white px-4 py-3 text-sm font-medium text-[#102018]">
                        <span className="inline-flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-[#43A047]" />
                          {user.name}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                        onClick={() => navigateAgrivo("page", getDashboardRoute())}
                      >
                        {t("nav.dashboard")}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]"
                        onClick={() => {
                          logout();
                          navigateToHash("home");
                        }}
                      >
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="mt-4 w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                      onClick={() => navigateAgrivo("page", "login")}
                    >
                      {t("nav.getStarted")}
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </HeaderTag>
  );
}
