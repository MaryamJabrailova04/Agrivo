import type { DashboardRoleConfig } from "../app/components/dashboard/dashboardConfig";
import type { TranslateFn } from "./LanguageContext";
import type { UserRole } from "../app/auth/authStorage";

export function localizeDashboardConfig(
  config: DashboardRoleConfig,
  t: TranslateFn,
): DashboardRoleConfig {
  const roleKey = config.role as UserRole;

  return {
    ...config,
    title: t(`dashboard.${roleKey}.title`, config.title),
    subtitle: t(`dashboard.${roleKey}.subtitle`, config.subtitle),
    navItems: config.navItems.map((item) => ({
      ...item,
      label: t(`dashboard.${roleKey}.nav.${item.id}`, item.label),
    })),
  };
}

export function getLocalizedRoleLabel(role: UserRole, t: TranslateFn): string {
  return t(`dashboard.roles.${role}`, role);
}
