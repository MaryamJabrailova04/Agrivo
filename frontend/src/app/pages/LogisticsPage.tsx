import type { LucideIcon } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Clock,
  Handshake,
  MapPin,
  Navigation,
  Package,
  Route,
  ShieldCheck,
  Sprout,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import agrivoLogoFooter from "../../assets/agrivo-logo-footer.png";
import { AgrivoNavbar } from "../components/AgrivoNavbar";
import { useLanguage } from "../../i18n/LanguageContext";
import type { TranslateFn } from "../../i18n/LanguageContext";
import { LogisticsHeroVisual } from "../components/logistics/LogisticsHeroVisual";
import { DeliveryTrackingTimeline } from "../components/delivery/DeliveryTrackingTimeline";
import type { TrackingEvent } from "../data/deliveryTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

const viewport = { once: true, amount: 0.2 } as const;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const HERO_CHIP_KEYS = [
  "logisticsPage.hero.farmPickup",
  "logisticsPage.hero.liveStatusUpdates",
  "logisticsPage.hero.verifiedHandoff",
] as const;

const DELIVERY_FLOW_STEPS = [
  {
    step: 1,
    titleKey: "logisticsPage.flow.steps.orderConfirmed.title",
    descriptionKey: "logisticsPage.flow.steps.orderConfirmed.description",
    icon: Store,
  },
  {
    step: 2,
    titleKey: "logisticsPage.flow.steps.pickupScheduled.title",
    descriptionKey: "logisticsPage.flow.steps.pickupScheduled.description",
    icon: ClipboardList,
  },
  {
    step: 3,
    titleKey: "logisticsPage.flow.steps.productInTransit.title",
    descriptionKey: "logisticsPage.flow.steps.productInTransit.description",
    icon: Truck,
  },
  {
    step: 4,
    titleKey: "logisticsPage.flow.steps.deliveryCompleted.title",
    descriptionKey: "logisticsPage.flow.steps.deliveryCompleted.description",
    icon: BadgeCheck,
  },
] as const;

const TRACKING_STEP_KEYS = [
  "logisticsPage.status.orderConfirmed",
  "logisticsPage.status.pickupScheduled",
  "logisticsPage.status.pickedUpFromFarm",
  "logisticsPage.status.inTransit",
  "logisticsPage.status.delivered",
] as const;

const DEMO_TRACKING_EVENTS: TrackingEvent[] = [
  {
    id: "1",
    stepId: "order_confirmed",
    labelKey: "delivery.timeline.order_confirmed",
    at: "",
    complete: true,
    current: false,
  },
  {
    id: "2",
    stepId: "preparing",
    labelKey: "delivery.timeline.preparing",
    at: "",
    complete: true,
    current: false,
  },
  {
    id: "3",
    stepId: "courier_assigned",
    labelKey: "delivery.timeline.courier_assigned",
    at: "",
    complete: true,
    current: false,
  },
  {
    id: "4",
    stepId: "picked_up",
    labelKey: "delivery.timeline.picked_up",
    at: "",
    complete: true,
    current: false,
  },
  {
    id: "5",
    stepId: "on_the_way",
    labelKey: "delivery.timeline.on_the_way",
    at: "",
    complete: false,
    current: true,
  },
  {
    id: "6",
    stepId: "delivered",
    labelKey: "delivery.timeline.delivered",
    at: "",
    complete: false,
    current: false,
  },
];

const CURRENT_TRACKING_INDEX = 3;

const BENEFIT_ITEMS = [
  {
    titleKey: "logisticsPage.partnerNetwork.verifiedRequests.title",
    descriptionKey: "logisticsPage.partnerNetwork.verifiedRequests.description",
    icon: ShieldCheck,
  },
  {
    titleKey: "logisticsPage.partnerNetwork.pickupDropoff.title",
    descriptionKey: "logisticsPage.partnerNetwork.pickupDropoff.description",
    icon: MapPin,
  },
  {
    titleKey: "logisticsPage.partnerNetwork.statusUpdates.title",
    descriptionKey: "logisticsPage.partnerNetwork.statusUpdates.description",
    icon: Navigation,
  },
  {
    titleKey: "logisticsPage.partnerNetwork.trustedPartnerships.title",
    descriptionKey: "logisticsPage.partnerNetwork.trustedPartnerships.description",
    icon: Handshake,
  },
] as const;

const ROLE_CARD_ITEMS = [
  {
    labelKey: "logisticsPage.roles.farmers.label",
    titleKey: "logisticsPage.roles.farmers.title",
    descriptionKey: "logisticsPage.roles.farmers.description",
    icon: Sprout,
  },
  {
    labelKey: "logisticsPage.roles.buyers.label",
    titleKey: "logisticsPage.roles.buyers.title",
    descriptionKey: "logisticsPage.roles.buyers.description",
    icon: Users,
  },
  {
    labelKey: "logisticsPage.roles.partners.label",
    titleKey: "logisticsPage.roles.partners.title",
    descriptionKey: "logisticsPage.roles.partners.description",
    icon: Truck,
  },
] as const;

const FAQ_ITEMS = [
  {
    questionKey: "logisticsPage.faq.questions.whoCanBecomePartner.question",
    answerKey: "logisticsPage.faq.questions.whoCanBecomePartner.answer",
  },
  {
    questionKey: "logisticsPage.faq.questions.canBuyersTrack.question",
    answerKey: "logisticsPage.faq.questions.canBuyersTrack.answer",
  },
  {
    questionKey: "logisticsPage.faq.questions.howAssigned.question",
    answerKey: "logisticsPage.faq.questions.howAssigned.answer",
  },
  {
    questionKey: "logisticsPage.faq.questions.proofRequired.question",
    answerKey: "logisticsPage.faq.questions.proofRequired.answer",
  },
] as const;

function formatFlowStepLabel(t: TranslateFn, step: number): string {
  return t("logisticsPage.flow.stepLabel").replace("{number}", String(step).padStart(2, "0"));
}

function SectionIntro({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`mx-auto mb-8 max-w-2xl text-center md:mb-12 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]">
        {eyebrow}
      </p>
      <h2 className="agrivo-heading agrivo-section-title text-[#102018]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base">{description}</p>
    </motion.div>
  );
}

function FlowStepCard({
  step,
  index,
  t,
}: {
  step: (typeof DELIVERY_FLOW_STEPS)[number];
  index: number;
  t: TranslateFn;
}) {
  const Icon = step.icon;

  return (
    <motion.article
      className="agrivo-logistics-flow-card agrivo-card"
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="agrivo-logistics-flow-card-inner">
        <div className="flex items-center justify-between gap-3">
          <div className="agrivo-step-icon">
            <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={2} />
          </div>
          <p className="agrivo-step-label">{formatFlowStepLabel(t, step.step)}</p>
        </div>
        <h3 className="agrivo-heading mt-4 text-lg font-bold text-[#102018]">{t(step.titleKey)}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5F6F64]">{t(step.descriptionKey)}</p>
      </div>
      {index < DELIVERY_FLOW_STEPS.length - 1 ? (
        <ChevronRight className="agrivo-logistics-flow-arrow hidden h-5 w-5 text-[#86efac] lg:block" aria-hidden />
      ) : null}
    </motion.article>
  );
}

function BenefitCard({
  benefit,
  index,
  t,
}: {
  benefit: (typeof BENEFIT_ITEMS)[number];
  index: number;
  t: TranslateFn;
}) {
  const Icon = benefit.icon;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="agrivo-logistics-benefit-card agrivo-card h-full rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]">
        <CardContent className="flex h-full flex-col p-6 sm:p-7">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f7ee]">
            <Icon className="h-5 w-5 text-[#14532d]" strokeWidth={1.75} />
          </div>
          <h3 className="agrivo-heading text-lg font-bold text-[#102018]">{t(benefit.titleKey)}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-[#5F6F64]">{t(benefit.descriptionKey)}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RoleCard({
  card,
  index,
  t,
}: {
  card: (typeof ROLE_CARD_ITEMS)[number];
  index: number;
  t: TranslateFn;
}) {
  const Icon = card.icon;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="agrivo-card h-full rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]">
        <CardContent className="flex h-full flex-col p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ecfdf5]">
              <Icon className="h-5 w-5 text-[#14532d]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
              {t(card.labelKey)}
            </p>
          </div>
          <h3 className="agrivo-heading text-xl font-bold text-[#102018]">{t(card.titleKey)}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-[#5F6F64]">{t(card.descriptionKey)}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export default function LogisticsPage() {
  const { t } = useLanguage();
  const goToPage = (page: string) => {
    navigateToHash(page);
  };

  const orderDetails = [
    { labelKey: "logisticsPage.visibility.product", valueKey: "logisticsPage.mock.tomatoesBatch" },
    { labelKey: "logisticsPage.visibility.farmer", value: "Ali Hasanov" },
    { labelKey: "logisticsPage.visibility.buyer", valueKey: "logisticsPage.mock.greenMarketBaku" },
    { labelKey: "logisticsPage.visibility.route", valueKey: "logisticsPage.mock.lankaranToBaku" },
  ] as const;

  const routeDetailItems = [
    { labelKey: "logisticsPage.routePlanning.distance", valueKey: "logisticsPage.mock.distance", icon: Route },
    { labelKey: "logisticsPage.routePlanning.estimatedTime", valueKey: "logisticsPage.mock.estimatedTime", icon: Clock },
    { labelKey: "logisticsPage.routePlanning.batch", valueKey: "logisticsPage.mock.applesBatch", icon: Package },
    { labelKey: "logisticsPage.routePlanning.status", valueKey: "logisticsPage.status.inTransit", icon: Truck },
  ] as const;

  return (
    <div className="agrivo-shell agrivo-logistics-page min-h-screen overflow-x-hidden">
      <AgrivoNavbar activeItem="logistics" />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden pb-12 pt-6 sm:pb-16 sm:pt-8 md:pb-20 lg:pb-24">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#F6FBF4_0%,#EEF8EE_55%,#FFFFFF_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(67,160,71,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(20,83,45,0.06),transparent_22%)]" />

          <div className="agrivo-container relative">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <motion.div
                initial="hidden"
                animate="show"
                variants={reveal}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:text-sm">
                  {t("logisticsPage.eyebrow")}
                </p>
                <h1 className="agrivo-heading text-3xl font-bold leading-tight text-[#102018] sm:text-4xl md:text-5xl">
                  {t("logisticsPage.heroTitle")}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#5F6F64] sm:text-base">
                  {t("logisticsPage.heroSubtitle")}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    className="agrivo-button-soft w-full rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B] sm:w-auto"
                    onClick={() => goToPage("login")}
                  >
                    {t("logisticsPage.becomePartner")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[#dbe7d4] bg-white px-6 text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
                    onClick={() => scrollToSection("tracking")}
                  >
                    {t("logisticsPage.trackDelivery")}
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {HERO_CHIP_KEYS.map((chipKey) => (
                    <span
                      key={chipKey}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe7d4] bg-white px-4 py-1.5 text-xs font-medium text-[#14532D] sm:text-sm"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#43A047]" />
                      {t(chipKey)}
                    </span>
                  ))}
                </div>
              </motion.div>

              <LogisticsHeroVisual />
            </div>
          </div>
        </section>

        <section className="agrivo-section bg-white">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.flow.eyebrow")}
              title={t("logisticsPage.flow.title")}
              description={t("logisticsPage.flow.subtitle")}
            />

            <div className="agrivo-logistics-flow-grid">
              {DELIVERY_FLOW_STEPS.map((step, index) => (
                <FlowStepCard key={step.step} step={step} index={index} t={t} />
              ))}
            </div>
          </div>
        </section>

        <section id="tracking" className="agrivo-section agrivo-scroll-anchor bg-[#f8faf4]">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.visibility.eyebrow")}
              title={t("logisticsPage.visibility.title")}
              description={t("logisticsPage.visibility.subtitle")}
            />

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={reveal}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="agrivo-logistics-tracking-card overflow-hidden rounded-[32px] border border-[#e5efe1] bg-white shadow-[0_16px_48px_rgba(20,83,45,0.08)]">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf2ea] pb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                        <Package className="h-5 w-5 text-[#14532d]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#6b7a70]">
                          {t("logisticsPage.visibility.orderId")}
                        </p>
                        <h3 className="agrivo-heading text-2xl font-bold text-[#102018]">AGR-2048</h3>
                      </div>
                    </div>
                    <Badge className="rounded-full border border-[#fde68a] bg-[#fffbeb] px-3 py-1 text-xs font-semibold text-[#b45309] hover:bg-[#fffbeb]">
                      {t("logisticsPage.status.inTransit")}
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {orderDetails.map((detail) => (
                      <div
                        key={detail.labelKey}
                        className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                          {t(detail.labelKey)}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-snug text-[#102018] sm:text-base">
                          {"valueKey" in detail ? t(detail.valueKey) : detail.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#102018]">
                        {t("delivery.trackShipment", "Track Shipment")}
                      </p>
                      <DeliveryTrackingTimeline events={DEMO_TRACKING_EVENTS} />
                    </div>
                    <div className="agrivo-logistics-timeline">
                      {TRACKING_STEP_KEYS.map((stepKey, index) => {
                        const isComplete = index < CURRENT_TRACKING_INDEX;
                        const isCurrent = index === CURRENT_TRACKING_INDEX;
                        const isPending = index > CURRENT_TRACKING_INDEX;

                        return (
                          <div
                            key={stepKey}
                            className={`agrivo-logistics-timeline-item ${isComplete ? "agrivo-logistics-timeline-item--done" : ""}`}
                          >
                            <div className="agrivo-logistics-timeline-marker-wrap">
                              <span
                                className={`agrivo-logistics-timeline-marker ${
                                  isCurrent
                                    ? "agrivo-logistics-timeline-marker--current"
                                    : isComplete
                                      ? "agrivo-logistics-timeline-marker--done"
                                      : "agrivo-logistics-timeline-marker--pending"
                                }`}
                              />
                              {index < TRACKING_STEP_KEYS.length - 1 ? (
                                <span
                                  className={`agrivo-logistics-timeline-line ${
                                    isComplete ? "agrivo-logistics-timeline-line--done" : ""
                                  }`}
                                />
                              ) : null}
                            </div>
                            <div
                              className={`agrivo-logistics-timeline-content ${
                                isCurrent ? "agrivo-logistics-timeline-content--current" : ""
                              } ${isPending ? "agrivo-logistics-timeline-content--pending" : ""}`}
                            >
                              <p className="text-sm font-semibold text-[#102018]">{t(stepKey)}</p>
                              {isCurrent ? (
                                <p className="mt-0.5 text-xs font-medium text-[#14532D]">
                                  {t("delivery.timeline.current", "Current status")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                        {t("delivery.logistics.coverage")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102018]">12 regions</p>
                    </div>
                    <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                        {t("delivery.logistics.citiesServed")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102018]">40+ cities</p>
                    </div>
                    <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                        {t("delivery.logistics.avgDeliveryTime")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102018]">2h 40m</p>
                    </div>
                    <div className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                        {t("delivery.logistics.stats")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#102018]">98% on-time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="agrivo-section bg-white">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.partnerNetwork.eyebrow")}
              title={t("logisticsPage.partnerNetwork.title")}
              description={t("logisticsPage.partnerNetwork.subtitle")}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
              {BENEFIT_ITEMS.map((benefit, index) => (
                <BenefitCard key={benefit.titleKey} benefit={benefit} index={index} t={t} />
              ))}
            </div>
          </div>
        </section>

        <section className="agrivo-section bg-[#f8faf4]">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.routePlanning.eyebrow")}
              title={t("logisticsPage.routePlanning.title")}
              description={t("logisticsPage.routePlanning.subtitle")}
            />

            <motion.div
              className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={reveal}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="agrivo-logistics-route-card overflow-hidden rounded-[32px] border border-[#e5efe1] bg-white shadow-[0_12px_36px_rgba(20,83,45,0.06)]">
                <CardContent className="p-5 sm:p-7">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f7ee]">
                      <Route className="h-5 w-5 text-[#14532d]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                        {t("logisticsPage.routePlanning.activeRoute")}
                      </p>
                      <h3 className="agrivo-heading text-lg font-bold text-[#102018] sm:text-xl">
                        {t("logisticsPage.routePlanning.activeRouteTitle")}
                      </h3>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[24px] border border-[#e5efe1] bg-[linear-gradient(180deg,#f8faf4_0%,#eef8ee_100%)] p-5 sm:p-6">
                    <svg className="h-36 w-full sm:h-44" viewBox="0 0 480 160" aria-hidden>
                      <path
                        d="M 40 120 Q 140 40, 240 70 T 440 50"
                        fill="none"
                        stroke="#dbe7d4"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <path
                        className="agrivo-logistics-route-progress-static"
                        d="M 40 120 Q 140 40, 240 70 T 440 50"
                        fill="none"
                        stroke="#43A047"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <circle cx="40" cy="120" r="8" fill="#14532D" />
                      <circle cx="440" cy="50" r="8" fill="#43A047" />
                    </svg>

                    <motion.div
                      className="absolute left-[48%] top-[38%] flex h-10 w-10 items-center justify-center rounded-xl border border-[#bbf7d0] bg-[#14532D] text-white shadow-md"
                      animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Truck className="h-4 w-4" />
                    </motion.div>

                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#3f5247]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#14532D]" />
                        {t("logisticsPage.routePlanning.routeFrom")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#43A047]" />
                        {t("logisticsPage.routePlanning.routeTo")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="agrivo-card flex h-full flex-col rounded-[32px] border border-[#e5efe1] bg-white shadow-[0_12px_36px_rgba(20,83,45,0.06)]">
                <CardContent className="flex flex-1 flex-col p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                    {t("logisticsPage.routePlanning.routeDetails")}
                  </p>
                  <h3 className="agrivo-heading mt-2 text-2xl font-bold text-[#102018]">
                    {t("logisticsPage.routePlanning.deliveryOverview")}
                  </h3>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {routeDetailItems.map((item) => {
                      const Icon = item.icon as LucideIcon;
                      return (
                        <div
                          key={item.labelKey}
                          className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#7a8b80]">
                            <Icon className="h-3.5 w-3.5 text-[#43A047]" />
                            {t(item.labelKey)}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-[#102018] sm:text-base">
                            {t(item.valueKey)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-6 rounded-[18px] border border-dashed border-[#bbf7d0] bg-[#f6fbf4] px-4 py-3 text-sm leading-6 text-[#3f5247]">
                    {t("logisticsPage.routePlanning.note")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="agrivo-section bg-white">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.roles.eyebrow")}
              title={t("logisticsPage.roles.title")}
              description={t("logisticsPage.roles.subtitle")}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
              {ROLE_CARD_ITEMS.map((card, index) => (
                <RoleCard key={card.labelKey} card={card} index={index} t={t} />
              ))}
            </div>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                className="agrivo-button-soft w-full rounded-full bg-[#14532D] px-8 text-white hover:bg-[#1D6A3B] sm:w-auto"
                onClick={() => goToPage("login")}
              >
                {t("logisticsPage.roles.joinPartner")}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-[#dbe7d4] px-8 text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto"
                onClick={() => goToPage("products")}
              >
                {t("logisticsPage.roles.browseMarketplace")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="agrivo-section bg-[#f8faf4]">
          <div className="agrivo-container">
            <SectionIntro
              eyebrow={t("logisticsPage.faq.eyebrow")}
              title={t("logisticsPage.faq.title")}
              description={t("logisticsPage.faq.subtitle")}
            />

            <motion.div
              className="mx-auto max-w-3xl"
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              variants={reveal}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Accordion type="single" collapsible className="space-y-3">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem
                    key={item.questionKey}
                    value={`faq-${index}`}
                    className="overflow-hidden rounded-[20px] border border-[#e5efe1] bg-white px-5 shadow-sm"
                  >
                    <AccordionTrigger className="py-4 text-left text-sm font-semibold text-[#102018] hover:no-underline sm:text-base">
                      {t(item.questionKey)}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-6 text-[#5F6F64]">
                      {t(item.answerKey)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-[#14532d] py-12 text-white sm:py-16">
        <div className="agrivo-container">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 xl:grid-cols-5">
            <div className="agrivo-reveal">
              <button
                type="button"
                className="footer-logo mb-6 inline-block"
                onClick={() => goToPage("home")}
                aria-label="Agrivo home"
              >
                <img src={agrivoLogoFooter} alt="Agrivo" width={170} height={48} decoding="async" />
              </button>
              <p className="max-w-sm text-sm leading-7 text-[#d1fae5]">{t("footer.tagline")}</p>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.platform")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("products")}>
                  {t("nav.marketplace")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("farmers")}>
                  {t("nav.farmers")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("jobs")}>
                  {t("nav.farmJobs")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("logistics")}>
                  {t("nav.logistics")}
                </button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.company")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("home")}>
                  {t("footer.about")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("products")}>
                  {t("footer.blog")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("farmers")}>
                  {t("footer.contact")}
                </button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.support")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("login")}>
                  {t("footer.helpCenter")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => scrollToSection("tracking")}>
                  {t("footer.trackOrders")}
                </button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("login")}>
                  {t("footer.privacy")}
                </button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.newsletter")}</h3>
              <p className="mt-4 text-sm leading-7 text-[#d1fae5]">{t("footer.newsletterDesc")}</p>
              <div className="mt-5 flex w-full max-w-sm flex-col gap-3 sm:flex-row lg:max-w-none lg:flex-col">
                <Input
                  type="email"
                  placeholder={t("footer.yourEmail")}
                  className="h-11 w-full rounded-full border-white/15 bg-white/10 text-white placeholder:text-[#bbf7d0] focus-visible:ring-1 focus-visible:ring-white sm:h-12"
                />
                <Button className="agrivo-button-soft h-11 w-full rounded-full bg-[#43A047] text-white hover:bg-[#4CAF50] sm:h-12 sm:w-auto lg:w-full">
                  {t("footer.subscribe")}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-[#bbf7d0] sm:mt-12 sm:pt-6 sm:text-left sm:text-sm">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
