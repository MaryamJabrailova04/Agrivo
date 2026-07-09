import { CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../../../i18n/LanguageContext";

const STATUS_CARD_KEYS = [
  {
    key: "logisticsPage.liveRoute.pickupScheduled",
    tone: "bg-white text-[#14532D]",
    active: false,
    delay: 0.2,
  },
  {
    key: "logisticsPage.liveRoute.inTransit",
    tone: "bg-[#14532D] text-white",
    active: true,
    delay: 0.35,
  },
  {
    key: "logisticsPage.liveRoute.delivered",
    tone: "bg-[#ecfdf5] text-[#166534]",
    active: false,
    delay: 0.5,
  },
] as const;

export function LogisticsHeroVisual() {
  const { t } = useLanguage();

  return (
    <div className="agrivo-logistics-hero-visual relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="pointer-events-none absolute -left-6 top-8 h-32 w-32 rounded-full bg-[#86efac]/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-4 bottom-6 h-28 w-28 rounded-full bg-[#bbf7d0]/30 blur-2xl" />

      <motion.div
        className="relative overflow-hidden rounded-[32px] border border-[#dbe7d4] bg-white p-5 shadow-[0_24px_60px_rgba(20,83,45,0.1)] sm:p-6"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803d]">
              {t("logisticsPage.liveRoute.eyebrow")}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#102018]">
              {t("logisticsPage.liveRoute.routeTitle")}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534]">
            <span className="agrivo-logistics-pulse h-2 w-2 rounded-full bg-[#43A047]" />
            {t("logisticsPage.liveRoute.inTransit")}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[#e5efe1] bg-[linear-gradient(180deg,#f8faf4_0%,#eef8ee_100%)] px-4 py-8 sm:px-6 sm:py-10">
          <svg
            className="agrivo-logistics-route-svg absolute inset-0 h-full w-full"
            viewBox="0 0 400 220"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="agrivo-logistics-route-track"
              d="M 48 170 C 90 150, 120 90, 170 80 S 260 60, 340 50"
              fill="none"
              stroke="#dbe7d4"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              className="agrivo-logistics-route-progress"
              d="M 48 170 C 90 150, 120 90, 170 80 S 260 60, 340 50"
              fill="none"
              stroke="#43A047"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative z-10 flex h-full min-h-[180px] flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#bbf7d0] bg-white shadow-sm">
                  <MapPin className="h-4 w-4 text-[#14532D]" />
                </div>
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#14532D] shadow-sm">
                  {t("logisticsPage.liveRoute.farmPickup")}
                </span>
              </div>

              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#bbf7d0] bg-[#14532D] text-white shadow-[0_8px_20px_rgba(20,83,45,0.2)]"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Truck className="h-5 w-5" />
              </motion.div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dbe7d4] bg-white shadow-sm">
                  <MapPin className="h-4 w-4 text-[#43A047]" />
                </div>
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#3f5247] shadow-sm">
                  {t("logisticsPage.liveRoute.marketDropoff")}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-center gap-3">
              {[1, 2, 3].map((crate) => (
                <div
                  key={crate}
                  className="flex h-14 w-12 flex-col items-center justify-end rounded-lg border border-[#c8e6c9] bg-[#f0fdf4] pb-1 shadow-sm"
                  style={{ transform: `rotate(${crate === 2 ? 0 : crate === 1 ? -4 : 4}deg)` }}
                >
                  <Package className="h-4 w-4 text-[#43A047]" />
                  <span className="mt-1 text-[9px] font-semibold text-[#166534]">
                    {t("logisticsPage.liveRoute.fresh")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STATUS_CARD_KEYS.map((card) => (
            <motion.div
              key={card.key}
              className={`rounded-2xl border border-[#e5efe1] px-3 py-2.5 text-center text-xs font-semibold shadow-sm ${card.tone}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              {card.active ? (
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t(card.key)}
                </span>
              ) : (
                t(card.key)
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
