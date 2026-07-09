import L from "leaflet";
import {
  Crosshair,
  LocateFixed,
  Maximize2,
  Minimize2,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { isMockMode } from "../../../config/dataMode";
import { useLanguage } from "../../../i18n/LanguageContext";
import {
  formatLogisticsEta,
  translateLogisticsLocation,
  translateLogisticsProduct,
} from "../../../i18n/logisticsDashboardHelpers";
import type { LogisticsRouteData, RouteStop } from "../../data/logisticsRoutes";
import { getRoutePathCoordinates } from "../../data/logisticsRoutes";
import {
  getPositionOnPath,
  getProgressFromPosition,
  progressToPercent,
  type LatLngTuple,
} from "../../utils/routeMapUtils";

const ROUTE_COLOR = "#43a047";
const ROUTE_WEIGHT = 5;
const SIMULATION_INTERVAL_MS = 3000;
const SIMULATION_STEP = 0.018;

function createMarkerIcon(className: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<span class="agrivo-route-map-marker ${className}" aria-hidden="true">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}

const pickupIcon = createMarkerIcon("agrivo-route-map-marker--pickup", "P");
const dropoffIcon = createMarkerIcon("agrivo-route-map-marker--dropoff", "D");
const vehicleIcon = L.divIcon({
  className: "",
  html: `<span class="agrivo-route-map-marker agrivo-route-map-marker--vehicle" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -14],
});

function stopIcon(stop: RouteStop) {
  return stop.type === "dropoff" ? dropoffIcon : pickupIcon;
}

function StopPopup({ stop }: { stop: RouteStop }) {
  const { t, language } = useLanguage();
  const stopName = translateLogisticsLocation(t, stop.name);

  if (stop.type === "pickup") {
    const product = stop.product
      ? translateLogisticsProduct(t, language, stop.product)
      : stop.product;
    return (
      <div className="agrivo-route-map-popup">
        <p className="agrivo-route-map-popup__title">{stopName}</p>
        <p className="agrivo-route-map-popup__line">
          {t("logisticsDashboard.route.pickupLine", {
            product: product ?? "",
            quantity: stop.quantity ?? "",
          })}
        </p>
        <p className="agrivo-route-map-popup__meta">
          {t("logisticsDashboard.route.timeLabel", { time: stop.time ?? "" })}
        </p>
      </div>
    );
  }

  return (
    <div className="agrivo-route-map-popup">
      <p className="agrivo-route-map-popup__title">{stopName}</p>
      <p className="agrivo-route-map-popup__line">
        {t("logisticsDashboard.route.deliveryDestination")}
      </p>
      <p className="agrivo-route-map-popup__meta">
        {stop.eta ? formatLogisticsEta(t, stop.eta) : null}
      </p>
    </div>
  );
}

function FitRouteBounds({
  positions,
  trigger,
}: {
  positions: LatLngTuple[];
  trigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    const bounds = L.latLngBounds(positions.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 9 });
  }, [map, positions, trigger]);

  return null;
}

function FollowVehicle({
  position,
  enabled,
}: {
  position: LatLngTuple;
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    map.panTo(position, { animate: true, duration: 0.6 });
  }, [enabled, map, position]);

  return null;
}

function MapResizeHandler({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [isFullscreen, map]);

  return null;
}

export interface RouteMapProps {
  route: LogisticsRouteData;
  onProgressChange?: (percent: number) => void;
  className?: string;
}

export function RouteMap({ route, onProgressChange, className }: RouteMapProps) {
  const { t } = useLanguage();
  const path = useMemo(() => getRoutePathCoordinates(route), [route]);
  const initialProgress = useMemo(
    () => getProgressFromPosition(path, [route.vehiclePosition.lat, route.vehiclePosition.lng]),
    [path, route.vehiclePosition.lat, route.vehiclePosition.lng],
  );

  const [routeProgress, setRouteProgress] = useState(initialProgress);
  const [followVehicle, setFollowVehicle] = useState(false);
  const [boundsTrigger, setBoundsTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const vehiclePosition = useMemo(
    () => getPositionOnPath(path, routeProgress),
    [path, routeProgress],
  );

  useEffect(() => {
    onProgressChange?.(progressToPercent(routeProgress));
  }, [onProgressChange, routeProgress]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRouteProgress((current) => {
        if (current >= 0.97) return current;
        return Math.min(0.97, current + SIMULATION_STEP);
      });
    }, SIMULATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleCenterRoute = useCallback(() => {
    setFollowVehicle(false);
    setBoundsTrigger((value) => value + 1);
  }, []);

  const handleFollowVehicle = useCallback(() => {
    setFollowVehicle((current) => !current);
  }, []);

  const handleRefreshLocation = useCallback(() => {
    setFollowVehicle(false);
    setRouteProgress(initialProgress);
    onProgressChange?.(progressToPercent(initialProgress));
  }, [initialProgress, onProgressChange]);

  const handleToggleFullscreen = useCallback(async () => {
    const element = shellRef.current;
    if (!element) return;

    if (document.fullscreenElement === element) {
      await document.exitFullscreen();
      return;
    }

    await element.requestFullscreen();
  }, []);

  const mapCenter = vehiclePosition;

  return (
    <div
      ref={shellRef}
      className={`agrivo-route-map-shell ${isFullscreen ? "agrivo-route-map-shell--fullscreen" : ""} ${className ?? ""}`}
    >
      <div className="agrivo-route-map-controls">
        <button
          type="button"
          className="agrivo-route-map-control"
          onClick={handleCenterRoute}
          title={t("logisticsDashboard.route.centerRoute")}
        >
          <Crosshair className="h-3.5 w-3.5" />
          <span>{t("logisticsDashboard.route.centerRoute")}</span>
        </button>
        <button
          type="button"
          className={`agrivo-route-map-control ${followVehicle ? "agrivo-route-map-control--active" : ""}`}
          onClick={handleFollowVehicle}
          title={t("logisticsDashboard.route.followVehicle")}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          <span>{t("logisticsDashboard.route.followVehicle")}</span>
        </button>
        <button
          type="button"
          className="agrivo-route-map-control"
          onClick={handleRefreshLocation}
          title={t("logisticsDashboard.route.refreshLocation")}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t("logisticsDashboard.route.refresh")}</span>
        </button>
        <button
          type="button"
          className="agrivo-route-map-control agrivo-route-map-control--icon"
          onClick={handleToggleFullscreen}
          title={
            isFullscreen
              ? t("logisticsDashboard.route.exitFullscreen")
              : t("logisticsDashboard.route.fullscreenMap")
          }
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="agrivo-route-map-container">
        <MapContainer
          center={mapCenter}
          zoom={8}
          scrollWheelZoom
          className="agrivo-route-map"
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitRouteBounds positions={path} trigger={boundsTrigger} />
          <FollowVehicle position={vehiclePosition} enabled={followVehicle} />
          <MapResizeHandler isFullscreen={isFullscreen} />

          <Polyline
            positions={path}
            pathOptions={{
              color: ROUTE_COLOR,
              weight: ROUTE_WEIGHT,
              opacity: 0.92,
              lineCap: "round",
              lineJoin: "round",
            }}
          />

          {route.stops.map((stop) => (
            <Marker key={`${stop.type}-${stop.name}`} position={[stop.lat, stop.lng]} icon={stopIcon(stop)}>
              <Popup className="agrivo-route-map-leaflet-popup">
                <StopPopup stop={stop} />
              </Popup>
            </Marker>
          ))}

          <Marker position={vehiclePosition} icon={vehicleIcon} zIndexOffset={1000}>
            <Popup className="agrivo-route-map-leaflet-popup">
              <div className="agrivo-route-map-popup">
                <p className="agrivo-route-map-popup__title">
                  {t("logisticsDashboard.route.currentVehicleLocation")}
                </p>
                <p className="agrivo-route-map-popup__line">
                  {t("logisticsDashboard.route.driver")}: {route.driver}
                </p>
                <p className="agrivo-route-map-popup__line">
                  {t("logisticsDashboard.route.vehicle")}: {route.vehicle}
                </p>
                <p className="agrivo-route-map-popup__meta">
                  {t("logisticsDashboard.route.statusInTransit")}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {isMockMode ? (
          <span className="agrivo-route-map-mock-badge" aria-hidden="true">
            <Truck className="h-3 w-3" />
            {t("logistics.mockLiveRouteTracking")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
