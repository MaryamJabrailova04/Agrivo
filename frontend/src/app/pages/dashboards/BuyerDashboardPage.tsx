import { useEffect, useState } from "react";
import { ProtectedDashboard } from "../../components/dashboard/ProtectedDashboard";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { BuyerOrderDetailPage } from "../../components/dashboard/BuyerOrderDetailPage";
import {
  BUYER_DASHBOARD,
  parseBuyerOrderIdFromHash,
} from "../../components/dashboard/dashboardConfig";
import { getRoutePathFromHash } from "../../../i18n/localizedRoutes";

export default function BuyerDashboardPage() {
  const [currentHash, setCurrentHash] = useState(
    () => getRoutePathFromHash() || BUYER_DASHBOARD.baseHash,
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(getRoutePathFromHash() || BUYER_DASHBOARD.baseHash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const orderId = parseBuyerOrderIdFromHash(BUYER_DASHBOARD.baseHash, currentHash);

  return (
    <ProtectedDashboard allowedRoles={["buyer"]}>
      {orderId ? (
        <DashboardLayout
          config={BUYER_DASHBOARD}
          activeNavId="orders"
          pageTitle="Order Details"
          hideIntro
        >
          <BuyerOrderDetailPage orderId={orderId} />
        </DashboardLayout>
      ) : (
        <DashboardLayout config={BUYER_DASHBOARD} />
      )}
    </ProtectedDashboard>
  );
}
