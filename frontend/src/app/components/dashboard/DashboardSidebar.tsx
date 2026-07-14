import { X } from "lucide-react";
import agrivoLogo from "../../../assets/agrivo-logo.png";
import type { AuthUser } from "../../auth/authStorage";
import { useCart } from "../../context/CartContext";
import { cn } from "../ui/utils";
import { DashboardSidebarFooter } from "./DashboardSidebarFooter";
import {
  getDashboardSectionHash,
  type DashboardRoleConfig,
} from "./dashboardConfig";

export function SidebarNav({
  config,
  activeNavId,
  onNavigate,
  onClose,
}: {
  config: DashboardRoleConfig;
  activeNavId: string;
  onNavigate: (hash: string) => void;
  onClose?: () => void;
}) {
  const { cartCount } = useCart();

  return (
    <nav className="agrivo-dashboard-nav">
      {config.navItems.map((item) => {
        const Icon = item.icon;
        const targetHash = item.externalHash ?? getDashboardSectionHash(config.baseHash, item.id);
        const isActive = activeNavId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={cn("agrivo-dashboard-nav-item", isActive && "agrivo-dashboard-nav-item--active")}
            onClick={() => {
              onNavigate(targetHash);
              onClose?.();
            }}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>
              {item.label}
              {item.id === "cart" ? ` (${cartCount ?? 0})` : ""}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardSidebarPanel({
  config,
  activeNavId,
  user,
  onNavigate,
  onBackHome,
  onLogout,
  onClose,
}: {
  config: DashboardRoleConfig;
  activeNavId: string;
  user: AuthUser | null;
  onNavigate: (hash: string) => void;
  onBackHome: () => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="agrivo-dashboard-sidebar-inner">
      <div className="agrivo-dashboard-sidebar-top">
        <button
          type="button"
          className="agrivo-dashboard-brand"
          onClick={onBackHome}
          aria-label="Agrivo home"
        >
          <img src={agrivoLogo} alt="Agrivo" />
        </button>
        {onClose ? (
          <button
            type="button"
            className="agrivo-dashboard-sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="agrivo-dashboard-sidebar-label">{config.title}</p>

      <SidebarNav
        config={config}
        activeNavId={activeNavId}
        onNavigate={onNavigate}
        onClose={onClose}
      />

      <DashboardSidebarFooter
        user={user}
        onBackHome={onBackHome}
        onLogout={onLogout}
      />
    </div>
  );
}

export function DashboardSidebarOverlay({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "agrivo-dashboard-overlay",
        visible && "agrivo-dashboard-overlay--visible",
      )}
      aria-label="Close menu"
      tabIndex={visible ? 0 : -1}
      onClick={onClose}
    />
  );
}

export function DashboardMobileMenuButton({
  onOpen,
  isOpen,
  className,
}: {
  onOpen: () => void;
  isOpen?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn("agrivo-dashboard-menu-btn", className)}
      onClick={onOpen}
      aria-label="Open menu"
      aria-expanded={isOpen ?? false}
    >
      <span className="agrivo-dashboard-menu-btn__bar" />
      <span className="agrivo-dashboard-menu-btn__bar" />
      <span className="agrivo-dashboard-menu-btn__bar" />
    </button>
  );
}
