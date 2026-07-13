import { useEffect, useMemo, useState } from "react";
import { Check, Truck } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { translateVehicleType, translateWeekday } from "../../../i18n/deliveryHelpers";
import {
  WEEKDAYS,
  type FarmerDeliverySettings,
  type FarmerVehicleType,
  type Weekday,
} from "../../data/deliveryTypes";
import {
  createDefaultFarmerDeliverySettings,
  getFarmerDeliverySettings,
  saveFarmerDeliverySettings,
} from "../../utils/farmerDeliverySettingsStorage";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../ui/utils";
import { isApiMode } from "../../../config/dataMode";
import {
  getFarmerDeliverySettingsApi,
  updateFarmerDeliverySettingsApi,
} from "../../../api/deliveryOptionsApi";

const VEHICLE_TYPES: FarmerVehicleType[] = ["motorcycle", "car", "pickup", "truck"];

export function FarmerDeliverySettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const farmerSlug = useMemo(() => {
    const base = user?.name?.toLowerCase().replace(/\s+/g, "-") || "farmer";
    return user?.id ? `farmer-${user.id.slice(0, 8)}` : base;
  }, [user?.id, user?.name]);

  const [settings, setSettings] = useState<FarmerDeliverySettings>(() =>
    getFarmerDeliverySettings(farmerSlug),
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiMode) {
      setSettings(getFarmerDeliverySettings(farmerSlug));
      return;
    }
    let mounted = true;
    getFarmerDeliverySettingsApi()
      .then((apiSettings) => {
        if (!mounted) return;
        setSettings({
          farmerSlug,
          ...apiSettings,
          vehicleType: apiSettings.vehicleType as FarmerVehicleType,
          workingDays: apiSettings.workingDays as Weekday[],
          updatedAt: new Date().toISOString(),
        });
      })
      .catch(() => {
        if (!mounted) return;
        setSettings(getFarmerDeliverySettings(farmerSlug));
      });
    return () => {
      mounted = false;
    };
  }, [farmerSlug]);

  const update = <K extends keyof FarmerDeliverySettings>(
    key: K,
    value: FarmerDeliverySettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSavedMessage(null);
  };

  const toggleDay = (day: Weekday) => {
    setSettings((current) => {
      const exists = current.workingDays.includes(day);
      return {
        ...current,
        workingDays: exists
          ? current.workingDays.filter((item) => item !== day)
          : [...current.workingDays, day],
      };
    });
    setSavedMessage(null);
  };

  const handleSave = async () => {
    if (isApiMode) {
      try {
        const saved = await updateFarmerDeliverySettingsApi(settings);
        setSettings({
          farmerSlug,
          ...saved,
          vehicleType: saved.vehicleType as FarmerVehicleType,
          workingDays: saved.workingDays as Weekday[],
          updatedAt: new Date().toISOString(),
        });
        setSavedMessage(t("delivery.farmerSettings.saved", "Delivery settings saved."));
      } catch {
        setSavedMessage(t("delivery.farmerSettings.saved", "Delivery settings saved."));
        saveFarmerDeliverySettings({ ...settings, farmerSlug });
      }
      return;
    }
    const next = saveFarmerDeliverySettings({
      ...settings,
      farmerSlug,
    });
    setSettings(next);
    setSavedMessage(t("delivery.farmerSettings.saved", "Delivery settings saved."));
  };

  const handleReset = () => {
    setSettings(createDefaultFarmerDeliverySettings(farmerSlug));
    setSavedMessage(null);
  };

  return (
    <section className="space-y-5">
      <div className="agrivo-dashboard-page-header">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-full bg-[#ecfdf5] p-2 text-[#14532D]">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
              {t("delivery.farmerSettings.title", "Delivery Settings")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F6F64] sm:text-base">
              {t(
                "delivery.farmerSettings.subtitle",
                "Configure how buyers can receive your products.",
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="agrivo-dashboard-panel space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["farmerDeliveryEnabled", "delivery.farmerSettings.enableFarmer"],
              ["logisticsEnabled", "delivery.farmerSettings.enableLogistics"],
              ["pickupEnabled", "delivery.farmerSettings.enablePickup"],
            ] as const
          ).map(([key, labelKey]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#e5efe1] bg-[#f8faf4] px-4 py-3 text-sm font-medium text-[#102018]"
            >
              <Checkbox
                checked={settings[key]}
                onCheckedChange={(checked) => update(key, Boolean(checked))}
              />
              {t(labelKey)}
            </label>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.deliveryFee")}</Label>
            <Input
              type="number"
              min={0}
              value={settings.deliveryFee}
              onChange={(event) => update("deliveryFee", Number(event.target.value) || 0)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.logisticsFee")}</Label>
            <Input
              type="number"
              min={0}
              value={settings.logisticsFee}
              onChange={(event) => update("logisticsFee", Number(event.target.value) || 0)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.radius")}</Label>
            <Input
              type="number"
              min={1}
              value={settings.radiusKm}
              onChange={(event) => update("radiusKm", Number(event.target.value) || 1)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.maxDaily")}</Label>
            <Input
              type="number"
              min={1}
              value={settings.maxDailyDeliveries}
              onChange={(event) => update("maxDailyDeliveries", Number(event.target.value) || 1)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.hoursStart")}</Label>
            <Input
              type="time"
              value={settings.deliveryHoursStart}
              onChange={(event) => update("deliveryHoursStart", event.target.value)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.hoursEnd")}</Label>
            <Input
              type="time"
              value={settings.deliveryHoursEnd}
              onChange={(event) => update("deliveryHoursEnd", event.target.value)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[#102018]">
            {t("delivery.farmerSettings.workingDays")}
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = settings.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "border-[#14532D] bg-[#EAF7EC] text-[#14532D]"
                      : "border-[#dbe7d4] bg-white text-[#5F6F64]",
                  )}
                >
                  {translateWeekday(t, day)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[#102018]">
            {t("delivery.farmerSettings.vehicleType")}
          </p>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_TYPES.map((vehicle) => {
              const active = settings.vehicleType === vehicle;
              return (
                <button
                  key={vehicle}
                  type="button"
                  onClick={() => update("vehicleType", vehicle)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "border-[#14532D] bg-[#14532D] text-white"
                      : "border-[#dbe7d4] bg-white text-[#5F6F64]",
                  )}
                >
                  {translateVehicleType(t, vehicle)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.pickupAddress")}</Label>
            <Input
              value={settings.pickupAddress}
              onChange={(event) => update("pickupAddress", event.target.value)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.prepMinutes")}</Label>
            <Input
              type="number"
              min={5}
              value={settings.pickupPrepMinutes}
              onChange={(event) => update("pickupPrepMinutes", Number(event.target.value) || 5)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.pickupHoursStart")}</Label>
            <Input
              type="time"
              value={settings.pickupHoursStart}
              onChange={(event) => update("pickupHoursStart", event.target.value)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("delivery.farmerSettings.pickupHoursEnd")}</Label>
            <Input
              type="time"
              value={settings.pickupHoursEnd}
              onChange={(event) => update("pickupHoursEnd", event.target.value)}
              className="h-11 rounded-full border-[#DEECE0] bg-[#F7FBF5]"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#102018]">
          <Checkbox
            checked={settings.sameDayAvailable}
            onCheckedChange={(checked) => update("sameDayAvailable", Boolean(checked))}
          />
          {t("delivery.farmerSettings.sameDay")}
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="rounded-full bg-[#14532D] text-white hover:bg-[#1D6A3B]"
            onClick={handleSave}
          >
            <Check className="mr-2 h-4 w-4" />
            {t("delivery.farmerSettings.save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#dbe7d4] text-[#14532D] hover:bg-[#EAF7EC]"
            onClick={handleReset}
          >
            Reset defaults
          </Button>
        </div>

        {savedMessage ? (
          <p className="rounded-xl border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-sm text-[#166534]">
            {savedMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
