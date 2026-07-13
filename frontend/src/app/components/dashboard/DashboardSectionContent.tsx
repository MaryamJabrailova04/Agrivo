import type { DashboardRoleConfig } from "./dashboardConfig";
import { getSectionLabel } from "./dashboardConfig";
import { BuyerProfilePage } from "./BuyerProfilePage";
import { BuyerBulkOrdersPage } from "./BuyerBulkOrdersPage";
import { BuyerCartPage } from "./BuyerCartPage";
import { BuyerDashboardOverview } from "./BuyerDashboardOverview";
import { BuyerOrdersPage } from "./BuyerOrdersPage";
import { BuyerSavedProductsPage } from "./BuyerSavedProductsPage";
import { FarmerDashboardOverview } from "./FarmerDashboardOverview";
import { FarmerProductsPage } from "./FarmerProductsPage";
import { FarmerAddProductPage } from "./FarmerAddProductPage";
import { FarmerEditProductPage } from "./FarmerEditProductPage";
import { FarmerOrdersPage } from "./FarmerOrdersPage";
import { FarmerDashboardProfilePage } from "./FarmerDashboardProfilePage";
import { FarmerDeliverySettingsPage } from "./FarmerDeliverySettingsPage";
import { AssignedDeliveriesPage } from "./AssignedDeliveriesPage";
import { CompletedDeliveriesPage } from "./CompletedDeliveriesPage";
import { InTransitPage } from "./InTransitPage";
import { PickupTasksPage } from "./PickupTasksPage";
import { LogisticsProfilePage } from "./LogisticsProfilePage";
import { LogisticsOverviewPage } from "./LogisticsOverviewPage";
import { AdminOverviewPage, AdminSectionPage } from "./admin/AdminSectionPages";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";

interface DashboardSectionContentProps {
  config: DashboardRoleConfig;
  sectionId: string;
}

export function DashboardOverviewContent({ config }: { config: DashboardRoleConfig }) {
  return (
    <>
      <PageHeader title="Overview" subtitle={config.subtitle} />

      <div className="agrivo-dashboard-stats">
        {config.summaryCards.map((card) => (
          <div key={card.label} className="agrivo-dashboard-stat-card">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{card.label}</p>
            <p className="agrivo-heading mt-2 text-2xl font-bold text-[#102018]">{card.value}</p>
            <p className="mt-1 text-xs text-[#5F6F64]">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="agrivo-dashboard-panel mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="agrivo-heading text-lg font-bold text-[#102018]">{config.mockListTitle}</h2>
        </div>
        <div className="space-y-3">
          {config.mockListItems.map((item) => (
            <div key={item.title} className="agrivo-dashboard-list-item">
              <div className="min-w-0">
                <p className="font-semibold text-[#102018]">{item.title}</p>
                <p className="mt-0.5 text-sm text-[#5F6F64]">{item.meta}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function parseFarmerProductEditId(sectionId: string): string | null {
  const match = /^products\/([^/]+)\/edit$/.exec(sectionId);
  return match?.[1] ?? null;
}

export function DashboardSectionContent({ config, sectionId }: DashboardSectionContentProps) {
  const farmerEditId = config.role === "farmer" ? parseFarmerProductEditId(sectionId) : null;
  if (farmerEditId) {
    return <FarmerEditProductPage productId={farmerEditId} />;
  }

  if (sectionId === "overview" && config.role === "buyer") {
    return <BuyerDashboardOverview />;
  }

  if (sectionId === "overview" && config.role === "farmer") {
    return <FarmerDashboardOverview />;
  }

  if (sectionId === "overview" && config.role === "logistics") {
    return <LogisticsOverviewPage />;
  }

  if (sectionId === "overview" && config.role === "admin") {
    return <AdminOverviewPage config={config} />;
  }

  if (config.role === "admin" && sectionId !== "overview") {
    return <AdminSectionPage sectionId={sectionId} />;
  }

  if (sectionId === "assigned" && config.role === "logistics") {
    return <AssignedDeliveriesPage />;
  }

  if (sectionId === "pickup" && config.role === "logistics") {
    return <PickupTasksPage />;
  }

  if (sectionId === "in-transit" && config.role === "logistics") {
    return <InTransitPage />;
  }

  if (sectionId === "completed" && config.role === "logistics") {
    return <CompletedDeliveriesPage />;
  }

  if (sectionId === "profile" && config.role === "logistics") {
    return <LogisticsProfilePage />;
  }

  if (sectionId === "products" && config.role === "farmer") {
    return <FarmerProductsPage />;
  }

  if (sectionId === "add-product" && config.role === "farmer") {
    return <FarmerAddProductPage />;
  }

  if (sectionId === "orders" && config.role === "farmer") {
    return <FarmerOrdersPage />;
  }

  if (sectionId === "delivery-settings" && config.role === "farmer") {
    return <FarmerDeliverySettingsPage />;
  }

  if (sectionId === "orders" && config.role === "buyer") {
    return <BuyerOrdersPage />;
  }

  if (sectionId === "saved" && config.role === "buyer") {
    return <BuyerSavedProductsPage />;
  }

  if (sectionId === "cart" && config.role === "buyer") {
    return <BuyerCartPage />;
  }

  if (sectionId === "bulk-orders" && config.role === "buyer") {
    return <BuyerBulkOrdersPage />;
  }

  if (sectionId === "profile" && config.role === "buyer") {
    return <BuyerProfilePage />;
  }

  if (sectionId === "profile" && config.role === "farmer") {
    return <FarmerDashboardProfilePage />;
  }

  if (sectionId === "overview") {
    return <DashboardOverviewContent config={config} />;
  }

  const sectionLabel = getSectionLabel(config, sectionId);
  return (
    <div className="agrivo-dashboard-panel">
      <PageHeader
        title={sectionLabel}
        subtitle="This section is being prepared. Check back soon for updates."
      />
    </div>
  );
}
