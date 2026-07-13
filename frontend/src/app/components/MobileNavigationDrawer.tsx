import { useEffect, useId, useRef } from "react";
import { LogOut, UserRound, X } from "lucide-react";
import agrivoLogo from "../../assets/agrivo-logo.png";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { useAuth } from "../auth/AuthContext";
import {
  agrivoMainNavItems,
  isNavItemActive,
  navigateAgrivo,
  type AgrivoNavActive,
} from "./agrivoNav";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface MobileNavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeItem?: AgrivoNavActive;
  triggerId: string;
}

export function MobileNavigationDrawer({
  open,
  onOpenChange,
  activeItem,
  triggerId,
}: MobileNavigationDrawerProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = () => onOpenChange(false);

    const onHashChange = () => close();
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        close();
      }
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const navigateAndClose = (kind: "home" | "page" | "section", target: string) => {
    onOpenChange(false);
    navigateAgrivo(kind, target);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="agrivo-mobile-navigation"
        side="right"
        showCloseButton={false}
        aria-labelledby={titleId}
        className="agrivo-mobile-drawer gap-0 border-l border-[#e5efe1] bg-[#F6FBF4] p-0 shadow-[-12px_0_40px_rgba(20,83,45,0.12)]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(triggerId)?.focus();
        }}
      >
        <SheetTitle id={titleId} className="sr-only">
          {t("nav.menuTitle", "Navigation menu")}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {t(
            "nav.menuDescription",
            "Primary site navigation links and account actions",
          )}
        </SheetDescription>

        <div className="agrivo-mobile-drawer__content">
          <div className="agrivo-mobile-drawer__header">
            <button
              type="button"
              className="navbar-logo"
              onClick={() => navigateAndClose("home", "top")}
              aria-label="Agrivo home"
            >
              <img src={agrivoLogo} alt="Agrivo" />
            </button>

            <SheetClose asChild>
              <button
                ref={closeRef}
                type="button"
                className="agrivo-mobile-drawer__close"
                aria-label={t("nav.closeMenu", "Close navigation menu")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetClose>
          </div>

          <nav
            className="agrivo-mobile-drawer__main"
            aria-label={t("nav.menuTitle", "Navigation menu")}
          >
            <ul className="agrivo-mobile-drawer__list">
              {agrivoMainNavItems.map((item) => {
                const isActive = isNavItemActive(item, activeItem);
                return (
                  <li key={item.labelKey}>
                    <button
                      type="button"
                      className={cn(
                        "agrivo-mobile-drawer__link",
                        isActive && "agrivo-mobile-drawer__link--active",
                      )}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => navigateAndClose(item.kind, item.target)}
                    >
                      {t(item.labelKey)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="agrivo-mobile-drawer__actions">
            {isAuthenticated && user ? (
              <>
                <div className="agrivo-mobile-drawer__user">
                  <UserRound className="h-4 w-4 shrink-0 text-[#43A047]" aria-hidden="true" />
                  <span className="truncate">{user.name}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="agrivo-mobile-drawer__btn agrivo-mobile-drawer__btn--secondary"
                  onClick={() => navigateAndClose("page", getDashboardRoute())}
                >
                  {t("nav.dashboard")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="agrivo-mobile-drawer__btn agrivo-mobile-drawer__btn--danger"
                  onClick={() => {
                    onOpenChange(false);
                    logout();
                    navigateToHash("home");
                  }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="agrivo-mobile-drawer__btn agrivo-mobile-drawer__btn--secondary"
                  onClick={() => navigateAndClose("page", "login")}
                >
                  {t("nav.login")}
                </Button>
                <Button
                  type="button"
                  className="agrivo-mobile-drawer__btn agrivo-mobile-drawer__btn--primary"
                  onClick={() => navigateAndClose("page", "register")}
                >
                  {t("nav.getStarted")}
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
