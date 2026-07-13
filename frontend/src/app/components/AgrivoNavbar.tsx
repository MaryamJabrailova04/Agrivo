import { useEffect, useId, useState } from "react";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { motion } from "motion/react";
import agrivoLogo from "../../assets/agrivo-logo.png";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { useAuth } from "../auth/AuthContext";
import {
  agrivoNavigationItems,
  isNavItemActive,
  navigateAgrivo,
  type AgrivoNavActive,
} from "./agrivoNav";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export {
  AGRIVO_HEADER_SCROLL_OFFSET,
  SCROLL_SECTION_KEY,
  agrivoMainNavItems,
  agrivoNavigationItems,
  consumePendingSectionScroll,
  isNavItemActive,
  navigateAgrivo,
  type AgrivoNavActive,
} from "./agrivoNav";

interface AgrivoNavbarProps {
  activeItem?: AgrivoNavActive;
  animateOnMount?: boolean;
}

export function AgrivoNavbar({ activeItem, animateOnMount = false }: AgrivoNavbarProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const { t } = useLanguage();
  const menuTriggerId = useId();

  const visibleNavItems = agrivoNavigationItems.filter(
    (item) => !(isAuthenticated && item.target === "login"),
  );

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      setHeaderScrolled(window.scrollY > 4);
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
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
                  onClick={() => navigateAgrivo("page", "register")}
                >
                  {t("nav.getStarted")}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSwitcher variant="compact" />
            <Button
              id={menuTriggerId}
              type="button"
              variant="ghost"
              size="icon"
              className="agrivo-mobile-menu-trigger h-11 w-11 rounded-full text-[#14532D] hover:bg-[#EAF7EC] hover:text-[#14532D]"
              aria-label={
                isMobileMenuOpen
                  ? t("nav.closeMenu", "Close navigation menu")
                  : t("nav.openMenu", "Open menu")
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="agrivo-mobile-navigation"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <MobileNavigationDrawer
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        activeItem={activeItem}
        triggerId={menuTriggerId}
      />
    </HeaderTag>
  );
}
