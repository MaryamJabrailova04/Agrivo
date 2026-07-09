import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { ScrollToTop } from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import FarmerProfilePage from "./pages/FarmerProfilePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FarmersPage from "./pages/FarmersPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import FarmerJobsDashboardPage from "./pages/FarmerJobsDashboardPage";
import CreateJobPage from "./pages/CreateJobPage";
import LogisticsPage from "./pages/LogisticsPage";
import BulkOrdersPage from "./pages/BulkOrdersPage";
import LoginPage from "./pages/LoginPage";
import BuyerDashboardPage from "./pages/dashboards/BuyerDashboardPage";
import FarmerDashboardPage from "./pages/dashboards/FarmerDashboardPage";
import LogisticsDashboardPage from "./pages/dashboards/LogisticsDashboardPage";
import AdminDashboardPage from "./pages/dashboards/AdminDashboardPage";
import { getRouteKey, resolveHashRoute } from "./routing/hashRoutes";
import { scrollToTopForCurrentRoute } from "./utils/scrollRestoration";
import { getAuthUser } from "./auth/authStorage";
import { getDashboardHashForRole } from "./auth/authService";
import { useLanguage } from "../i18n/LanguageContext";
import { buildHash, parseHash, replaceHash } from "../i18n/localizedRoutes";

function redirectToRoleDashboard(): string | null {
  const user = getAuthUser();
  if (!user) return null;
  return getDashboardHashForRole(user.role);
}

export default function App() {
  const { language, setLanguageFromUrl } = useLanguage();
  const [currentPage, setCurrentPage] = useState("home");
  const [farmerSlug, setFarmerSlug] = useState<string | null>(null);
  const [jobSlug, setJobSlug] = useState<string | null>(null);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);

      if (!parsed.language) {
        replaceHash(parsed.path, language);
        return;
      }

      setLanguageFromUrl(parsed.language);

      if (parsed.path === "dashboard") {
        const dashboardRoute = redirectToRoleDashboard();
        if (dashboardRoute) {
          replaceHash(dashboardRoute, parsed.language);
          return;
        }
        replaceHash("login", parsed.language);
        return;
      }

      const route = resolveHashRoute(parsed.path);

      scrollToTopForCurrentRoute();

      setCurrentPage(route.page);
      setFarmerSlug(route.farmerSlug);
      setJobSlug(route.jobSlug);
      setEditJobId(route.editJobId);
      setProductSlug(route.productSlug);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [language, setLanguageFromUrl]);

  const routeKey = useMemo(
    () =>
      getRouteKey({
        page: currentPage,
        farmerSlug,
        jobSlug,
        editJobId,
        productSlug,
      }),
    [currentPage, farmerSlug, jobSlug, editJobId, productSlug],
  );

  const handleNavigate = (page: string) => {
    replaceHash(page, language);
  };

  const renderPage = () => {
    if (currentPage === "login" || currentPage === "register") {
      return (
        <div className="min-h-screen overflow-x-hidden">
          <LoginPage />
        </div>
      );
    }

    if (currentPage === "dashboard-buyer") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <BuyerDashboardPage />
        </div>
      );
    }

    if (currentPage === "dashboard-farmer") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <FarmerDashboardPage />
        </div>
      );
    }

    if (currentPage === "dashboard-logistics") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <LogisticsDashboardPage />
        </div>
      );
    }

    if (currentPage === "dashboard-admin") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <AdminDashboardPage />
        </div>
      );
    }

    if (currentPage === "farmer-profile" && farmerSlug) {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <FarmerProfilePage slug={farmerSlug} />
        </div>
      );
    }

    if (currentPage === "farmers") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <FarmersPage />
        </div>
      );
    }

    if (currentPage === "product-detail" && productSlug) {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <ProductDetailPage slug={productSlug} />
        </div>
      );
    }

    if (currentPage === "products" || currentPage === "marketplace") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <ProductsPage />
        </div>
      );
    }

    if (currentPage === "jobs") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <JobsPage />
        </div>
      );
    }

    if (currentPage === "job-detail" && jobSlug) {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <JobDetailPage slug={jobSlug} />
        </div>
      );
    }

    if (currentPage === "dashboard-jobs") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <FarmerJobsDashboardPage />
        </div>
      );
    }

    if (currentPage === "jobs-create") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <CreateJobPage editJobId={editJobId} />
        </div>
      );
    }

    if (currentPage === "logistics") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <LogisticsPage />
        </div>
      );
    }

    if (currentPage === "home") {
      return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf4]">
          <HomePage />
        </div>
      );
    }

    return (
      <div className="min-h-screen overflow-x-hidden bg-white">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <main>{currentPage === "bulk-orders" ? <BulkOrdersPage /> : null}</main>
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  };

  return (
    <>
      <ScrollToTop routeKey={routeKey} />
      {renderPage()}
    </>
  );
}
