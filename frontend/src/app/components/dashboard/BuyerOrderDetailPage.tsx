import { navigateToHash } from "../../../i18n/localizedRoutes";
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import {
  getBuyerOrderDetail,
  getBuyerOrdersListHash,
  type BuyerOrderDetail,
  type BuyerOrderStatus,
} from "../../data/buyerDashboard";
import { BuyerOrderStatusBadge } from "./BuyerOrderStatusBadge";
import { ProductImage } from "../products/ProductImage";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface BuyerOrderDetailPageProps {
  orderId: string;
}

function navigate(hash: string) {
  navigateToHash(hash);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="agrivo-buyer-order-detail-row">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#102018]">{value}</dd>
    </div>
  );
}

function OrderTrackingTimeline({ order }: { order: BuyerOrderDetail }) {
  if (order.status === "Cancelled") {
    return (
      <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b91c1c]" />
          <div>
            <p className="font-semibold text-[#b91c1c]">Order cancelled</p>
            <p className="mt-1 text-sm text-[#7f1d1d]">
              {order.cancelledReason ?? "This order was cancelled and will not be delivered."}
            </p>
            {order.cancelledAt ? (
              <p className="mt-1 text-xs text-[#991b1b]">Cancelled on {order.cancelledAt}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ol className="agrivo-buyer-order-detail-timeline">
      {order.timelineSteps.map((step) => (
        <li
          key={step.label}
          className={cn(
            "agrivo-buyer-order-detail-timeline-item",
            step.status === "complete" && "agrivo-buyer-order-detail-timeline-item--done",
            step.status === "current" && "agrivo-buyer-order-detail-timeline-item--current",
            step.status === "pending" && "agrivo-buyer-order-detail-timeline-item--pending",
          )}
        >
          <span className="agrivo-buyer-order-detail-timeline-dot" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#102018]">{step.label}</p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                step.status === "current"
                  ? "font-semibold text-[#14532D]"
                  : step.status === "complete"
                    ? "text-[#166534]"
                    : "text-[#9ca3af]",
              )}
            >
              {step.datetime ?? (step.status === "pending" ? "Pending" : "—")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function getHeroActions(status: BuyerOrderStatus) {
  switch (status) {
    case "Delivered":
      return ["reorder", "review"] as const;
    case "Cancelled":
      return ["reorder", "support"] as const;
    case "In Transit":
    case "Pickup Scheduled":
      return ["track", "logistics"] as const;
    case "Pending":
    case "Confirmed":
    case "Preparing":
      return ["track", "farmer", "logistics", "cancel"] as const;
    default:
      return ["farmer", "logistics"] as const;
  }
}

function parseRouteCities(route: string): { pickupCity: string; dropoffCity: string } {
  const parts = route.split("→").map((part) => part.trim());
  return {
    pickupCity: parts[0] ?? "Origin",
    dropoffCity: parts[1] ?? "Destination",
  };
}

function getRouteMapVariant(status: BuyerOrderStatus): string {
  switch (status) {
    case "In Transit":
      return "agrivo-route-map--in-transit";
    case "Pickup Scheduled":
      return "agrivo-route-map--pickup-scheduled";
    case "Delivered":
      return "agrivo-route-map--delivered";
    case "Cancelled":
      return "agrivo-route-map--cancelled";
    case "Preparing":
      return "agrivo-route-map--preparing";
    default:
      return "agrivo-route-map--confirmed";
  }
}

function buildGoogleMapsUrl(pickup: string, dropoff: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin: pickup,
    destination: dropoff,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function RoutePreviewCard({ order }: { order: BuyerOrderDetail }) {
  const { pickupCity, dropoffCity } = parseRouteCities(order.route);
  const mapVariant = getRouteMapVariant(order.status);
  const isCancelled = order.status === "Cancelled";
  const estimatedDelivery =
    order.deliveredDate ?? order.estimatedDelivery ?? "—";

  const scrollToTracking = () => {
    document.getElementById("order-tracking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openGoogleMaps = () => {
    window.open(buildGoogleMapsUrl(order.pickupLocation, order.dropoffLocation), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="agrivo-dashboard-panel agrivo-buyer-order-route-card">
      <h3 className="agrivo-heading text-lg font-bold text-[#102018]">Route Preview</h3>

      <div className={cn("agrivo-route-map mt-4", mapVariant)}>
        <svg
          className="agrivo-route-map__canvas"
          viewBox="0 0 320 140"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="routeMapBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f7ee" />
              <stop offset="100%" stopColor="#e8f5e4" />
            </linearGradient>
            <linearGradient id="routeLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
          </defs>
          <rect width="320" height="140" fill="url(#routeMapBg)" rx="12" />
          <path
            className="agrivo-route-map__road"
            d="M0 95 H320 M0 55 H320 M80 0 V140 M200 0 V140"
          />
          <path
            className="agrivo-route-map__road agrivo-route-map__road--secondary"
            d="M0 115 Q160 80 320 45"
          />
          <path
            className="agrivo-route-map__route"
            d="M 42 108 Q 120 72 168 58 T 278 32"
          />
          <path
            className="agrivo-route-map__route agrivo-route-map__route--pulse"
            d="M 42 108 Q 120 72 168 58 T 278 32"
          />
        </svg>

        <div className="agrivo-route-map__pin agrivo-route-map__pin--pickup" title="Pickup">
          <MapPin className="h-3.5 w-3.5" />
          <span className="agrivo-route-map__pin-ring" />
        </div>

        <div className="agrivo-route-map__pin agrivo-route-map__pin--dropoff" title="Drop-off">
          <Navigation className="h-3.5 w-3.5" />
          <span className="agrivo-route-map__pin-ring" />
        </div>

        {!isCancelled ? (
          <div className="agrivo-route-map__truck" title="Delivery vehicle">
            <Truck className="h-3.5 w-3.5" />
          </div>
        ) : null}

        <div className="agrivo-route-map__status">
          <span className="text-[10px] font-medium text-[#6b7a70]">Status</span>
          <BuyerOrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="agrivo-route-locations mt-4 space-y-3">
        <div className="agrivo-route-location-row">
          <div className="agrivo-route-location-icon agrivo-route-location-icon--pickup">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">Pickup</p>
            <p className="mt-0.5 text-sm font-semibold text-[#102018]">{order.pickupLocation}</p>
            <p className="text-xs text-[#5F6F64]">{pickupCity}</p>
          </div>
        </div>

        <div className="agrivo-route-location-row">
          <div className="agrivo-route-location-icon agrivo-route-location-icon--dropoff">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">Drop-off</p>
            <p className="mt-0.5 text-sm font-semibold text-[#102018]">{order.dropoffLocation}</p>
            <p className="text-xs text-[#5F6F64]">{dropoffCity}</p>
          </div>
        </div>
      </div>

      <div className="agrivo-route-stats mt-4">
        <div className="agrivo-route-stat">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">Distance</p>
          <p className="mt-1 text-sm font-bold text-[#102018]">{order.estimatedDistance}</p>
        </div>
        <div className="agrivo-route-stat">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">Est. time</p>
          <p className="mt-1 text-sm font-bold text-[#102018]">{order.estimatedTime}</p>
        </div>
        <div className="agrivo-route-stat agrivo-route-stat--wide">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7a70]">
            {order.status === "Delivered" ? "Delivered on" : "Est. delivery"}
          </p>
          <p className="mt-1 text-sm font-bold text-[#14532D]">{estimatedDelivery}</p>
        </div>
      </div>

      <div className="agrivo-route-actions mt-4 flex flex-col gap-2">
        {!isCancelled ? (
          <Button
            className="w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={scrollToTracking}
          >
            <Truck className="mr-2 h-4 w-4" />
            Track Route
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
          onClick={openGoogleMaps}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>
    </section>
  );
}

function OrderDetailContent({ order }: { order: BuyerOrderDetail }) {
  const heroActions = getHeroActions(order.status);
  const isDelivered = order.status === "Delivered";
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="agrivo-buyer-order-detail">
      <button
        type="button"
        className="agrivo-buyer-order-detail-back"
        onClick={() => navigate(getBuyerOrdersListHash())}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Orders
      </button>

      <div className="agrivo-buyer-order-detail-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
            Order Details
          </p>
          <h2 className="agrivo-heading mt-1 text-2xl font-bold text-[#102018] sm:text-3xl">
            {order.orderId}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#5F6F64]">Status:</span>
            <BuyerOrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="agrivo-buyer-order-detail-layout">
        <div className="agrivo-buyer-order-detail-main space-y-5">
          <section className="agrivo-dashboard-panel agrivo-buyer-order-detail-hero">
            <div className="agrivo-buyer-order-detail-hero-top">
              <div className="agrivo-buyer-order-detail-hero-image">
                <ProductImage
                  name={order.product}
                  src={order.image}
                  alt={`${order.product} product image`}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="agrivo-heading text-xl font-bold text-[#102018] sm:text-2xl">
                  {order.product} · {order.quantity}
                </h3>
                <p className="mt-2 text-sm text-[#5F6F64]">
                  <span className="font-medium text-[#102018]">Farmer:</span> {order.farmer}
                </p>
                <p className="mt-1 text-sm text-[#5F6F64]">
                  <span className="font-medium text-[#102018]">Route:</span> {order.route}
                </p>
                <p className="mt-1 text-sm text-[#5F6F64]">
                  <span className="font-medium text-[#102018]">Ordered on:</span> {order.orderDate}
                </p>
                <p className="mt-1 text-sm text-[#5F6F64]">
                  <span className="font-medium text-[#102018]">
                    {isDelivered ? "Delivered:" : "Estimated delivery:"}
                  </span>{" "}
                  {isDelivered
                    ? order.deliveredDate ?? order.estimatedDelivery
                    : order.estimatedDelivery ?? "—"}
                </p>
              </div>
            </div>

            <div className="agrivo-buyer-order-detail-hero-actions">
              {heroActions.includes("track") ? (
                <Button className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]">
                  <Truck className="mr-2 h-4 w-4" />
                  Track Order
                </Button>
              ) : null}
              {heroActions.includes("reorder") ? (
                <Button className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reorder
                </Button>
              ) : null}
              {heroActions.includes("review") ? (
                <Button className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]">
                  <Star className="mr-2 h-4 w-4" />
                  Leave Review
                </Button>
              ) : null}
              {heroActions.includes("farmer") ? (
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Farmer
                </Button>
              ) : null}
              {heroActions.includes("logistics") ? (
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Contact Logistics
                </Button>
              ) : null}
              {heroActions.includes("cancel") ? (
                <Button
                  variant="outline"
                  className="rounded-full border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              ) : null}
              {heroActions.includes("support") ? (
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              ) : null}
              {isDelivered ? (
                <Button
                  variant="outline"
                  className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              ) : null}
            </div>
          </section>

          <section className="agrivo-dashboard-panel">
            <h3 className="agrivo-heading text-lg font-bold text-[#102018]">Product Details</h3>
            <dl className="agrivo-buyer-order-detail-grid mt-4">
              <DetailRow label="Product" value={order.product} />
              <DetailRow label="Category" value={order.category} />
              <DetailRow label="Quantity" value={order.quantity} />
              <DetailRow label="Unit price" value={order.unitPrice} />
              <DetailRow label="Subtotal" value={order.subtotal} />
              <DetailRow label="Harvested" value={order.harvestDate} />
              <DetailRow label="Batch ID" value={order.batchId} />
            </dl>
            <p className="mt-4 rounded-xl border border-[#dbe7d4] bg-[#f6fbf4] px-3 py-2.5 text-sm text-[#3f5247]">
              <span className="font-semibold text-[#14532D]">Freshness:</span> {order.freshnessNote}
            </p>
          </section>

          <section className="agrivo-dashboard-panel" id="order-tracking">
            <h3 className="agrivo-heading text-lg font-bold text-[#102018]">Order Tracking</h3>
            <div className="mt-4">
              <OrderTrackingTimeline order={order} />
            </div>
          </section>

          <section className="agrivo-dashboard-panel">
            <h3 className="agrivo-heading text-lg font-bold text-[#102018]">Delivery Information</h3>
            <dl className="agrivo-buyer-order-detail-grid mt-4">
              <DetailRow label="Delivery to" value={order.deliveryAddress} />
              <DetailRow label="Route" value={order.route} />
              <DetailRow
                label={isDelivered ? "Delivered on" : "Estimated delivery"}
                value={
                  isDelivered
                    ? (order.deliveredDate ?? "—")
                    : (order.estimatedDelivery ?? "—")
                }
              />
              <DetailRow label="Logistics partner" value={order.logisticsPartner} />
              <DetailRow label="Delivery contact" value={order.deliveryContact} />
            </dl>
            <p className="mt-4 rounded-xl border border-[#edf2ea] bg-[#f8faf4] px-3 py-2.5 text-sm text-[#5F6F64]">
              <span className="font-semibold text-[#102018]">Delivery note:</span>{" "}
              {order.deliveryNotes}
            </p>
            {!isCancelled ? (
              <Button
                variant="outline"
                className="mt-4 rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Logistics
              </Button>
            ) : null}
          </section>
        </div>

        <aside className="agrivo-buyer-order-detail-sidebar space-y-5">
          <section className="agrivo-dashboard-panel">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] text-sm font-bold text-[#14532D]">
                {order.farmer.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="agrivo-heading text-base font-bold text-[#102018]">{order.farmer}</h3>
                {order.farmerVerified ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#166534]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified Farmer
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-[#5F6F64]">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                {order.farmerLocation}
              </p>
              <p className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                Rating: {order.farmerRating}
              </p>
              <p>{order.farmerCompletedOrders} completed orders</p>
              <p>
                <span className="font-medium text-[#102018]">Specializes in:</span>{" "}
                {order.farmerSpecialization}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="w-full rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
                onClick={() => navigate(`farmers/${order.farmerSlug}`)}
              >
                View Farmer Profile
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Farmer
              </Button>
            </div>
          </section>

          <section className="agrivo-dashboard-panel">
            <h3 className="agrivo-heading text-lg font-bold text-[#102018]">Payment Summary</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-[#5F6F64]">Product subtotal</dt>
                <dd className="font-semibold text-[#102018]">{order.subtotal}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-[#5F6F64]">Delivery fee</dt>
                <dd className="font-semibold text-[#102018]">{order.deliveryFee}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-[#5F6F64]">Service fee</dt>
                <dd className="font-semibold text-[#102018]">{order.serviceFee}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-[#edf2ea] pt-3">
                <dt className="text-base font-bold text-[#102018]">Total</dt>
                <dd className="agrivo-heading text-xl font-bold text-[#14532D]">{order.grandTotal}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-[#5F6F64]">Payment method</dt>
                <dd className="font-semibold text-[#102018]">{order.paymentMethod}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-[#5F6F64]">Payment status</dt>
                <dd className="font-semibold text-[#102018]">{order.paymentStatus}</dd>
              </div>
            </dl>
          </section>

          <RoutePreviewCard order={order} />
        </aside>
      </div>
    </div>
  );
}

export function BuyerOrderDetailPage({ orderId }: BuyerOrderDetailPageProps) {
  const { user } = useAuth();
  const order = getBuyerOrderDetail(orderId, user?.id);

  if (!order) {
    return (
      <section className="agrivo-dashboard-panel">
        <div className="agrivo-dashboard-empty py-12">
          <h3 className="agrivo-heading text-xl font-bold text-[#102018]">Order not found</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5F6F64]">
            We could not find this order in your account.
          </p>
          <Button
            className="mt-6 rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={() => navigate(getBuyerOrdersListHash())}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Orders
          </Button>
        </div>
      </section>
    );
  }

  return <OrderDetailContent order={order} />;
}
