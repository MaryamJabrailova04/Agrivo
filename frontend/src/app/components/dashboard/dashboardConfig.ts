import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  PackagePlus,
  ShoppingCart,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import type { UserRole } from "../../auth/authStorage";

export type DashboardSectionId = string;

export interface DashboardNavItem {
  id: DashboardSectionId;
  label: string;
  icon: LucideIcon;
  /** Navigate to a different hash instead of dashboard section */
  externalHash?: string;
}

export interface DashboardRoleConfig {
  role: UserRole;
  baseHash: string;
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
  summaryCards: Array<{ label: string; value: string; hint: string }>;
  mockListTitle: string;
  mockListItems: Array<{ title: string; meta: string; status: string }>;
}

export const BUYER_DASHBOARD: DashboardRoleConfig = {
  role: "buyer",
  baseHash: "dashboard/buyer",
  title: "Buyer Dashboard",
  subtitle: "Manage your orders, saved products, and marketplace activity.",
  navItems: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "My Orders", icon: ClipboardList },
    { id: "saved", label: "Saved Products", icon: Heart },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "bulk-orders", label: "Bulk Orders", icon: Package },
    { id: "profile", label: "Profile", icon: UserRound },
  ],
  summaryCards: [
    { label: "Active orders", value: "3", hint: "Awaiting delivery" },
    { label: "Saved products", value: "12", hint: "From verified farmers" },
    { label: "Cart items", value: "0", hint: "Ready to order" },
    { label: "Completed orders", value: "28", hint: "All time" },
  ],
  mockListTitle: "Recent orders",
  mockListItems: [
    { title: "Tomatoes · 80 kg", meta: "Safarova Orchard Hills", status: "In transit" },
    { title: "Potatoes · 120 kg", meta: "Ganja Root Fields", status: "Delivered" },
    { title: "Apples · 60 kg", meta: "Quba Orchard Farm", status: "Confirmed" },
  ],
};

export const FARMER_DASHBOARD: DashboardRoleConfig = {
  role: "farmer",
  baseHash: "dashboard/farmer",
  title: "Farmer Dashboard",
  subtitle: "Manage your products, farm jobs, orders, and profile.",
  navItems: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "My Products", icon: Package },
    { id: "add-product", label: "Add Product", icon: PackagePlus },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "delivery-settings", label: "Delivery Settings", icon: Truck },
    { id: "farm-jobs", label: "Farm Jobs", icon: Briefcase, externalHash: "dashboard/jobs" },
    { id: "create-job", label: "Create Job Post", icon: Briefcase, externalHash: "dashboard/jobs/new" },
    { id: "profile", label: "Profile", icon: UserRound },
  ],
  summaryCards: [
    { label: "Listed products", value: "8", hint: "Active listings" },
    { label: "Open orders", value: "4", hint: "From buyers" },
    { label: "Active job posts", value: "2", hint: "Seasonal roles" },
    { label: "Completed sales", value: "46", hint: "This season" },
  ],
  mockListTitle: "Recent buyer orders",
  mockListItems: [
    { title: "Cherries · 45 kg", meta: "Green Market Baku", status: "Pickup scheduled" },
    { title: "Carrots · 90 kg", meta: "Local Produce Hub", status: "Confirmed" },
    { title: "Pears · 30 kg", meta: "Restaurant Supply Co.", status: "Delivered" },
  ],
};

export const LOGISTICS_DASHBOARD: DashboardRoleConfig = {
  role: "logistics",
  baseHash: "dashboard/logistics",
  title: "Logistics Dashboard",
  subtitle: "View assigned deliveries, update delivery status, and manage routes.",
  navItems: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "assigned", label: "Assigned Deliveries", icon: Truck },
    { id: "pickup", label: "Pickup Tasks", icon: MapPin },
    { id: "in-transit", label: "In Transit", icon: Truck },
    { id: "completed", label: "Completed Deliveries", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: UserRound },
  ],
  summaryCards: [
    { label: "Assigned today", value: "6", hint: "Delivery tasks" },
    { label: "Pickup pending", value: "2", hint: "Farm handoffs" },
    { label: "In transit", value: "3", hint: "On the road" },
    { label: "Completed", value: "18", hint: "This week" },
  ],
  mockListTitle: "Active delivery tasks",
  mockListItems: [
    { title: "Lankaran Farm → Baku Market", meta: "Tomatoes · 120 kg", status: "In transit" },
    { title: "Quba Farm → Baku Market", meta: "Apples · 200 kg", status: "Pickup scheduled" },
    { title: "Ganja Fields → Ganja Hub", meta: "Potatoes · 150 kg", status: "Assigned" },
  ],
};

export const ADMIN_DASHBOARD: DashboardRoleConfig = {
  role: "admin",
  baseHash: "dashboard/admin",
  title: "Admin Dashboard",
  subtitle: "Manage users, products, farmers, jobs, and platform activity.",
  navItems: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "farmers", label: "Farmers", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "farm-jobs", label: "Farm Jobs", icon: Briefcase },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
  summaryCards: [
    { label: "Registered users", value: "248", hint: "All roles" },
    { label: "Verified farmers", value: "64", hint: "Active profiles" },
    { label: "Open orders", value: "37", hint: "Across marketplace" },
    { label: "Active job posts", value: "19", hint: "Farm Jobs" },
  ],
  mockListTitle: "Platform activity",
  mockListItems: [
    { title: "New farmer registration", meta: "Aysel Mammadova", status: "Pending review" },
    { title: "Bulk order placed", meta: "Green Market Baku", status: "Confirmed" },
    { title: "Delivery completed", meta: "AGR-2048", status: "Delivered" },
  ],
};

export function getDashboardConfig(role: UserRole): DashboardRoleConfig {
  switch (role) {
    case "buyer":
      return BUYER_DASHBOARD;
    case "farmer":
      return FARMER_DASHBOARD;
    case "logistics":
      return LOGISTICS_DASHBOARD;
    case "admin":
      return ADMIN_DASHBOARD;
    default:
      return BUYER_DASHBOARD;
  }
}

export function getDashboardSectionHash(baseHash: string, sectionId: string): string {
  if (sectionId === "overview") {
    return baseHash;
  }
  return `${baseHash}/${sectionId}`;
}

export function parseDashboardSection(baseHash: string, hash: string): string {
  if (hash === baseHash) {
    return "overview";
  }
  if (hash.startsWith(`${baseHash}/orders/`)) {
    return "orders";
  }
  if (hash.startsWith(`${baseHash}/`)) {
    return hash.slice(baseHash.length + 1) || "overview";
  }
  return "overview";
}

export function parseBuyerOrderIdFromHash(baseHash: string, hash: string): string | null {
  const prefix = `${baseHash}/orders/`;
  if (!hash.startsWith(prefix)) {
    return null;
  }
  const orderId = decodeURIComponent(hash.slice(prefix.length).split("/")[0] ?? "");
  return orderId || null;
}

export function getSectionLabel(config: DashboardRoleConfig, sectionId: string): string {
  return config.navItems.find((item) => item.id === sectionId)?.label ?? "Overview";
}

export function getDashboardRoleLabel(role: UserRole): string {
  switch (role) {
    case "buyer":
      return "Buyer";
    case "farmer":
      return "Farmer";
    case "logistics":
      return "Logistics Partner";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
}

/** Resolve active sidebar item, including external dashboard routes like job management. */
export function resolveDashboardNavId(config: DashboardRoleConfig, hash: string): string {
  if (config.role === "buyer" && hash.startsWith(`${config.baseHash}/orders/`)) {
    return "orders";
  }

  if (config.role === "farmer") {
    if (hash === "dashboard/jobs/new") {
      return "create-job";
    }
    if (hash === "dashboard/jobs" || hash.startsWith("dashboard/jobs/edit/")) {
      return "farm-jobs";
    }
    if (hash.startsWith(`${config.baseHash}/products/`) && hash.endsWith("/edit")) {
      return "products";
    }
  }

  for (const item of config.navItems) {
    if (!item.externalHash) continue;
    if (hash === item.externalHash || hash.startsWith(`${item.externalHash}/`)) {
      return item.id;
    }
  }

  return parseDashboardSection(config.baseHash, hash);
}

export const FARMER_DASHBOARD_JOBS_HASH = "dashboard/jobs";
export const FARMER_DASHBOARD_JOBS_NEW_HASH = "dashboard/jobs/new";
export const FARMER_DASHBOARD_HOME_HASH = "dashboard/farmer";
