import {
  ArrowRight,
  MapPin,
  Navigation,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { navigateToHash } from "../../../i18n/localizedRoutes";
import { useAuth } from "../../auth/AuthContext";
import {
  buyerCurrentDelivery,
  buyerRecentOrders,
  buyerRecommendedProducts,
  buyerSavedProducts,
  buyerSummaryStats,
  buyerTrackingSteps,
  getBuyerOrderDetailHash,
} from "../../data/buyerDashboard";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatLocalizedQuantity,
  formatTodayAt,
  localizePriceUnit,
  translateBuyerProductName,
  translateBuyerRoute,
} from "../../../i18n/buyerDashboardHelpers";
import { getDashboardSectionHash } from "./dashboardConfig";
import { BuyerOrderStatusBadge } from "./BuyerOrderStatusBadge";
import { ProductImage } from "../products/ProductImage";
import { Button } from "../ui/button";

const BUYER_BASE = "dashboard/buyer";

function navigate(hash: string) {
  navigateToHash(hash);
}

function sectionHash(sectionId: string) {
  return getDashboardSectionHash(BUYER_BASE, sectionId);
}

export function BuyerDashboardOverview() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const firstName = user?.name?.split(" ")[0] ?? t("dashboard.roles.buyer");

  return (
    <div className="agrivo-buyer-overview space-y-6">
      {/* Greeting + quick actions */}
      <section className="agrivo-dashboard-panel agrivo-buyer-welcome">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">{t("buyerDashboard.hero.eyebrow")}</p>
            <h2 className="agrivo-heading mt-1 text-2xl font-bold text-[#102018] sm:text-3xl">
              {t("buyerDashboard.hero.welcomeBack").replace("{name}", firstName)}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#5F6F64] sm:text-base">
              {t("buyerDashboard.hero.subtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
            <Button
              className="agrivo-button-soft rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
              onClick={() => navigate("products")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {t("buyerDashboard.hero.browseMarketplace")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(sectionHash("cart"))}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("buyerDashboard.hero.viewCart")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(sectionHash("bulk-orders"))}
            >
              <Package className="mr-2 h-4 w-4" />
              {t("buyerDashboard.hero.createBulkOrder")}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              onClick={() => navigate(sectionHash("orders"))}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {t("buyerDashboard.hero.trackOrders")}
            </Button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="agrivo-buyer-stats">
        {buyerSummaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.id}
              type="button"
              className="agrivo-buyer-stat-card agrivo-card text-left"
              onClick={() => {
                if (stat.id === "cart") navigate(sectionHash("cart"));
                else if (stat.id === "saved") navigate(sectionHash("saved"));
                else navigate(sectionHash("orders"));
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5]">
                  <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={1.75} />
                </div>
                <span className="agrivo-heading text-2xl font-bold text-[#102018]">{stat.value}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#102018]">
                {t(`buyerDashboard.stats.${stat.id === "active" ? "activeOrders" : stat.id === "cart" ? "cartItems" : stat.id === "saved" ? "savedProducts" : stat.id === "completed" ? "completedOrders" : "pendingDeliveries"}`)}
              </p>
              <p className="mt-0.5 text-xs text-[#6b7a70]">
                {t(`buyerDashboard.stats.${stat.id === "active" ? "awaitingDelivery" : stat.id === "cart" ? "readyToOrder" : stat.id === "saved" ? "fromVerifiedFarmers" : stat.id === "completed" ? "allTime" : "inTransit"}`)}
              </p>
            </button>
          );
        })}
      </section>

      {/* Tracking + recent orders */}
      <section className="agrivo-buyer-split">
        <div className="agrivo-dashboard-panel agrivo-buyer-tracking">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                {t("buyerDashboard.currentDelivery.eyebrow")}
              </p>
              <h3 className="agrivo-heading mt-1 text-xl font-bold text-[#102018]">
                {translateBuyerProductName(t, buyerCurrentDelivery.product)} · {formatLocalizedQuantity(t, language, buyerCurrentDelivery.quantity)}
              </h3>
            </div>
            <BuyerOrderStatusBadge status={buyerCurrentDelivery.status} />
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-[#5F6F64]">
              <span className="font-medium text-[#102018]">{t("buyerDashboard.currentDelivery.farmer")}:</span> {buyerCurrentDelivery.farmer}
            </p>
            <p className="text-[#5F6F64]">
              <span className="font-medium text-[#102018]">{t("buyerDashboard.currentDelivery.route")}:</span> {translateBuyerRoute(t, buyerCurrentDelivery.route)}
            </p>
            <p className="text-[#5F6F64]">
              <span className="font-medium text-[#102018]">{t("buyerDashboard.currentDelivery.estimatedDelivery")}:</span>{" "}
              {formatTodayAt(t, buyerCurrentDelivery.estimatedDelivery)}
            </p>
          </div>

          <div className="agrivo-buyer-timeline mt-6">
            {buyerTrackingSteps.map((step, index) => (
              <div key={step.label} className="agrivo-buyer-timeline-step">
                <div className="agrivo-buyer-timeline-marker-wrap">
                  <span
                    className={`agrivo-buyer-timeline-marker ${
                      step.current
                        ? "agrivo-buyer-timeline-marker--current"
                        : step.complete
                          ? "agrivo-buyer-timeline-marker--done"
                          : ""
                    }`}
                  />
                  {index < buyerTrackingSteps.length - 1 ? (
                    <span
                      className={`agrivo-buyer-timeline-line ${
                        step.complete ? "agrivo-buyer-timeline-line--done" : ""
                      }`}
                    />
                  ) : null}
                </div>
                <p
                  className={`text-xs font-semibold sm:text-sm ${
                    step.current ? "text-[#14532D]" : step.complete ? "text-[#166534]" : "text-[#9ca3af]"
                  }`}
                >
                  {step.label === "Picked up" ? t("status.pickedUp") : step.label === "In transit" ? t("status.inTransit") : step.label === "Confirmed" ? t("status.confirmed") : step.label === "Delivered" ? t("status.delivered") : step.label}
                </p>
              </div>
            ))}
          </div>

          <Button
            className="agrivo-button-soft mt-6 w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B] sm:w-auto"
            onClick={() => navigate(sectionHash("orders"))}
          >
            {t("buyerDashboard.currentDelivery.trackOrder")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="agrivo-dashboard-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="agrivo-heading text-lg font-bold text-[#102018]">{t("buyerDashboard.recentOrders.title")}</h3>
            <button
              type="button"
              className="text-xs font-semibold text-[#14532D] hover:text-[#1D6A3B]"
              onClick={() => navigate(sectionHash("orders"))}
            >
              {t("buyerDashboard.recentOrders.viewAll")}
            </button>
          </div>

          {buyerRecentOrders.length > 0 ? (
            <div className="space-y-3">
              {buyerRecentOrders.map((order) => (
                <div key={order.id} className="agrivo-buyer-order-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#102018]">
                        {translateBuyerProductName(t, order.product)} · {formatLocalizedQuantity(t, language, order.quantity)}
                      </p>
                      <p className="mt-1 text-sm text-[#5F6F64]">{t("buyerDashboard.recentOrders.farmer")}: {order.farmer}</p>
                    </div>
                    <BuyerOrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-[#5F6F64] sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-[#102018]">{t("buyerDashboard.recentOrders.total")}:</span> {order.total}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                      {translateBuyerRoute(t, order.route)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                      onClick={() => navigate(getBuyerOrderDetailHash(order.orderId))}
                    >
                      {t("buyerDashboard.recentOrders.viewDetails")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                      onClick={() => navigate(getBuyerOrderDetailHash(order.orderId))}
                    >
                      {t("buyerDashboard.recentOrders.trackOrder")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="agrivo-dashboard-empty">
              <p className="text-sm text-[#5F6F64]">
                {t("buyerDashboard.recentOrders.noOrders")}
              </p>
              <Button
                className="mt-4 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                onClick={() => navigate("products")}
              >
                {t("buyerDashboard.hero.browseMarketplace")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Recommended products */}
      <section className="agrivo-dashboard-panel">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
              {t("buyerDashboard.marketplacePicks.eyebrow")}
            </p>
            <h3 className="agrivo-heading mt-1 text-lg font-bold text-[#102018]">{t("buyerDashboard.marketplacePicks.title")}</h3>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-[#14532D] hover:text-[#1D6A3B]"
            onClick={() => navigate("products")}
          >
            {t("buyerDashboard.marketplacePicks.seeAll")}
          </button>
        </div>

        <div className="agrivo-buyer-product-grid">
          {buyerRecommendedProducts.map((product) => (
            <div key={product.id} className="agrivo-buyer-product-card agrivo-card">
              <div className="agrivo-buyer-product-image">
                <ProductImage
                  name={product.name}
                  src={product.image}
                  category={product.category}
                  alt={`${translateBuyerProductName(t, product.name)} product image`}
                  className="h-full w-full"
                />
              </div>
              <div className="p-4">
                <p className="flex items-center gap-1 text-xs text-[#6b7a70]">
                  <MapPin className="h-3 w-3 text-[#43A047]" />
                  {product.location}
                </p>
                <h4 className="mt-1 font-semibold text-[#102018]">{translateBuyerProductName(t, product.name)}</h4>
                <p className="mt-0.5 text-xs text-[#5F6F64]">{product.farmer}</p>
                <p className="mt-2 text-sm font-bold text-[#14532D]">{localizePriceUnit(t, language, product.price)}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                    onClick={() => navigate(sectionHash("cart"))}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    {t("buyerDashboard.marketplacePicks.addToCart")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                    onClick={() => navigate("products")}
                  >
                    {t("buyerDashboard.marketplacePicks.view")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved products preview */}
      <section className="agrivo-dashboard-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="agrivo-heading text-lg font-bold text-[#102018]">{t("buyerDashboard.savedProducts.title")}</h3>
          <button
            type="button"
            className="text-xs font-semibold text-[#14532D] hover:text-[#1D6A3B]"
            onClick={() => navigate(sectionHash("saved"))}
          >
            {t("buyerDashboard.savedProducts.viewAll")}
          </button>
        </div>

        {buyerSavedProducts.length > 0 ? (
          <div className="space-y-2">
            {buyerSavedProducts.map((product) => (
              <div key={product.id} className="agrivo-buyer-saved-row">
                <div className="min-w-0">
                  <p className="font-semibold text-[#102018]">{translateBuyerProductName(t, product.name)}</p>
                  <p className="text-sm text-[#5F6F64]">
                    {product.farmer} · {localizePriceUnit(t, language, product.price)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                  onClick={() => navigate(sectionHash("cart"))}
                >
                  {t("buyerDashboard.savedProducts.addToCart")}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="agrivo-dashboard-empty py-8">
            <p className="text-sm text-[#5F6F64]">You have not saved any products yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
