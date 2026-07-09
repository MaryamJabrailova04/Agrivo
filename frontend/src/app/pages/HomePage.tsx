import { useEffect, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import {
  Apple,
  ArrowRight,
  Carrot,
  ChevronRight,
  Milk,
  Package,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import agrivoLogoFooter from "../../assets/agrivo-logo-footer.png";
import { featuredFarmers } from "../data/farmers";
import { getProductDetailHash } from "../data/harvestExplorer";
import { getProductImage } from "../utils/productImages";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { AgrivoNavbar, AGRIVO_HEADER_SCROLL_OFFSET, consumePendingSectionScroll } from "../components/AgrivoNavbar";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  formatLandingPrice,
  translateLandingBadge,
  translateLandingProductName,
  translateLandingTag,
} from "../../i18n/landingHelpers";
import { FeaturedFarmerCard } from "../components/FeaturedFarmerCard";
import { FeaturedProductCard } from "../components/FeaturedProductCard";
import { HeroVideoCard } from "../components/HeroVideoCard";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

const heroTitleTone = ["text-[#14532D]", "text-[#43A047]", "text-[#14532D]"] as const;

const categoryMeta: Array<{ key: "vegetables" | "fruits" | "dairy"; icon: LucideIcon; accent: string; iconTint: string }> = [
  { key: "vegetables", icon: Carrot, accent: "bg-[#edf8ef]", iconTint: "text-[#1f8d4b]" },
  { key: "fruits", icon: Apple, accent: "bg-[#fff6e8]", iconTint: "text-[#d97706]" },
  { key: "dairy", icon: Milk, accent: "bg-[#eef6ff]", iconTint: "text-[#2563eb]" },
];

const landingProductMeta = [
  {
    name: "Potatoes",
    slug: "potatoes-ganja-root-fields",
    location: "Gəncə-Daşkəsən > Gəncə > Gəncə qəsəbə",
    farmer: "Ganja Root Fields",
    quantity: "240 kg",
    priceAmount: "0.95",
    badge: "Open Field",
    tags: ["Delivery available"],
    imageKey: "Potatoes" as const,
  },
  {
    name: "Carrots",
    slug: "carrots-ganja-root-fields",
    location: "Gəncə-Daşkəsən > Gəncə > Gəncə kənd",
    farmer: "Ganja Root Fields",
    quantity: "110 kg",
    priceAmount: "1.20",
    badge: "Fresh",
    tags: ["Verified farmer"],
    imageKey: "Carrots" as const,
  },
  {
    name: "Cherries",
    slug: "cherries-safarova-orchard-hills",
    location: "Quba-Xaçmaz > Quba > Adur",
    farmer: "Safarova Orchard Hills",
    quantity: "85 kg",
    priceAmount: "3.40",
    badge: "Organic",
    tags: ["Delivery available"],
    imageKey: "Cherries" as const,
  },
  {
    name: "Apples",
    slug: "apples-aysel-mammadova",
    location: "Quba-Xaçmaz > Quba > Alpan",
    farmer: "Quba Orchard Grove",
    quantity: "175 kg",
    priceAmount: "1.70",
    badge: "Fresh",
    tags: ["Verified farmer", "Delivery available"],
    imageKey: "Apples" as const,
  },
];

const marketInsightMeta = [
  { id: "demand", value: "+18%", tone: "bg-[#ecfdf5] text-[#166534]", icon: TrendingUp, indicator: "trend" as const },
  {
    id: "delivery",
    value: "92%",
    tone: "bg-[#eff6ff] text-[#1d4ed8]",
    icon: Truck,
    indicator: "progress" as const,
    progress: 92,
  },
  {
    id: "freshness",
    valueKey: "landing.marketSignals.low",
    tone: "bg-[#f0fdf4] text-[#15803d]",
    icon: ShieldCheck,
    indicator: "status" as const,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const categoryViewport = { once: true, amount: 0.3 } as const;

const categoryReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]">{eyebrow}</p>
      <h2 className="agrivo-heading agrivo-section-title text-[#102018]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  const heroTitleLines = useMemo(
    () => [
      { text: t("hero.title1"), tone: heroTitleTone[0] },
      { text: t("hero.title2"), tone: heroTitleTone[1] },
      { text: t("hero.title3"), tone: heroTitleTone[2] },
    ],
    [t],
  );

  const categories = useMemo(
    () =>
      categoryMeta.map((item) => ({
        name: t(`home.${item.key}`),
        subtitle: t(`home.${item.key}Desc`),
        icon: item.icon,
        accent: item.accent,
        iconTint: item.iconTint,
      })),
    [t],
  );

  const products = useMemo(
    () =>
      landingProductMeta.map((product) => ({
        name: translateLandingProductName(t, product.name),
        slug: product.slug,
        location: product.location,
        farmer: product.farmer,
        quantity: product.quantity,
        harvestDate: t("landing.products.thisWeek"),
        price: formatLandingPrice(t, product.priceAmount),
        badge: product.badge ? translateLandingBadge(t, product.badge) : undefined,
        tags: product.tags.map((tag) => translateLandingTag(t, tag)),
        image: getProductImage(product.imageKey),
      })),
    [t],
  );

  const traceabilityStages = useMemo(
    () => [
      t("landing.traceability.harvested"),
      t("landing.traceability.packed"),
      t("landing.traceability.inTransit"),
      t("landing.traceability.delivered"),
    ],
    [t],
  );

  const batchDetails = useMemo(
    () => [
      { label: t("landing.traceability.product"), value: t("landing.traceability.sampleProduct") },
      { label: t("landing.traceability.origin"), value: t("landing.traceability.sampleOrigin") },
      { label: t("landing.traceability.farmer"), value: t("landing.traceability.sampleFarmer") },
      { label: t("landing.traceability.quantity"), value: t("landing.traceability.sampleQuantity") },
      { label: t("landing.traceability.route"), value: t("landing.traceability.sampleRoute") },
      { label: t("landing.traceability.quality"), value: t("landing.traceability.sampleQuality") },
    ],
    [t],
  );

  const marketInsights = useMemo(
    () =>
      marketInsightMeta.map((insight) => ({
        id: insight.id,
        label:
          insight.id === "demand"
            ? t("landing.marketSignals.demandTrend")
            : insight.id === "delivery"
              ? t("landing.marketSignals.deliveryReliability")
              : t("landing.marketSignals.freshnessRisk"),
        value: insight.valueKey ? t(insight.valueKey) : insight.value ?? "",
        tone: insight.tone,
        description:
          insight.id === "demand"
            ? t("landing.marketSignals.demandDescription")
            : insight.id === "delivery"
              ? t("landing.marketSignals.deliveryDescription")
              : t("landing.marketSignals.freshnessDescription"),
        icon: insight.icon,
        indicator: insight.indicator,
        progress: insight.progress,
      })),
    [t],
  );

  const deliveredStageLabel = t("landing.traceability.delivered");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      consumePendingSectionScroll(AGRIVO_HEADER_SCROLL_OFFSET);
    }, 120);

    return () => window.clearTimeout(timer);
  }, []);

  const goToPage = (page: string) => {
    navigateToHash(page);
  };

  const goToFarmerProfile = (slug: string) => {
    navigateToHash(`farmers/${slug}`);
  };

  const goToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const top = section.getBoundingClientRect().top + window.scrollY - AGRIVO_HEADER_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleNavigation = (kind: "home" | "page" | "section", target: string) => {
    if (kind === "page") {
      goToPage(target);
      return;
    }

    if (kind === "section") {
      goToSection(target);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="agrivo-shell min-h-screen overflow-x-hidden">
      <AgrivoNavbar activeItem="home" animateOnMount />
      <div className="agrivo-header-spacer" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden pb-12 pt-6 sm:pb-16 sm:pt-8 md:pb-20 md:pt-10 lg:pb-24 lg:pt-14">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#F6FBF4_0%,#EEF8EE_55%,#FFFFFF_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(67,160,71,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(217,154,36,0.10),transparent_20%)] sm:h-[34rem]" />
          <div className="agrivo-container relative">
            <div className="agrivo-hero-grid">
              <motion.div
                className="order-1 min-w-0 lg:max-w-[600px]"
                initial="hidden"
                animate="show"
                variants={staggerWrap}
                transition={{ delayChildren: 0.08 }}
              >
                <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                  <Badge className="mb-4 rounded-full border border-[#D7EEDB] bg-white px-3 py-1 text-xs text-[#14532D] shadow-sm hover:bg-white sm:mb-6 sm:px-4 sm:py-1.5 sm:text-sm">
                    {t("hero.badge")}
                  </Badge>
                </motion.div>

                <div className="space-y-0.5 sm:space-y-1">
                  {heroTitleLines.map((line, index) => (
                    <motion.div
                      key={line.text}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.2 + index * 0.32,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`agrivo-heading agrivo-hero-title font-bold tracking-[-0.04em] sm:tracking-[-0.05em] ${line.tone}`}
                    >
                      {line.text}
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-4 max-w-xl text-base leading-7 text-[#5F6F64] sm:mt-6 sm:text-[1.05rem] sm:leading-8"
                >
                  {t("hero.subtitle")}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap"
                >
                  <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="agrivo-button-soft w-full rounded-full bg-[#14532D] px-6 text-white hover:bg-[#1D6A3B] hover:shadow-[0_18px_38px_rgba(20,83,45,0.22)] sm:w-auto" onClick={() => goToPage("products")}>
                      {t("hero.exploreMarketplace")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline" className="w-full rounded-full border-[#14532D] bg-white px-6 text-[#14532D] hover:bg-[#EAF7EC] sm:w-auto" onClick={() => goToPage("login")}>
                      {t("hero.joinAsFarmer")}
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 w-full max-w-[520px] rounded-[24px] border border-[#DEECE0] bg-white p-3 shadow-[0_18px_50px_rgba(20,83,45,0.09)] sm:mt-7 sm:rounded-[28px]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F7F74]" />
                      <Input
                        type="search"
                        placeholder={t("hero.searchPlaceholder")}
                        className="h-11 rounded-full border-0 bg-[#F7FBF5] pl-11 text-sm font-medium text-[#102018] shadow-none placeholder:text-[#97A59B] focus-visible:ring-1 focus-visible:ring-[#43A047] sm:h-12 sm:text-base"
                      />
                    </div>
                    <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button className="h-11 w-full rounded-full bg-[#43A047] px-7 text-white hover:bg-[#4CAF50] hover:shadow-[0_14px_28px_rgba(67,160,71,0.24)] sm:h-12 sm:w-auto" onClick={() => goToPage("products")}>
                        {t("hero.search")}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  variants={staggerWrap}
                  transition={{ staggerChildren: 0.12 }}
                  className="mt-6 grid w-full max-w-[520px] grid-cols-3 gap-2 sm:mt-8 sm:gap-4"
                >
                  {[
                    { end: 100, label: t("hero.statFarmers") },
                    { end: 1000, label: t("hero.statOrders") },
                    { end: 50, label: t("hero.statProductTypes") },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeUp}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-[18px] border border-white/90 bg-white p-3 shadow-[0_18px_40px_rgba(20,83,45,0.08)] sm:rounded-[24px] sm:p-5"
                    >
                      <AnimatedCounter
                        end={stat.end}
                        suffix="+"
                        duration={1800}
                        className="agrivo-heading block text-[clamp(1.35rem,4.5vw,2rem)] font-bold leading-none text-[#14532D]"
                      />
                      <div className="mt-1 text-[0.7rem] font-medium text-[#5F6F64] sm:mt-2 sm:text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="relative order-2 w-full min-w-0 lg:justify-self-end lg:pb-12"
                initial={{ opacity: 0, x: 42, y: -12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
              >
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  className="relative w-full max-w-[780px] overflow-hidden rounded-[32px] border border-[rgba(20,83,45,0.12)] bg-white/96 p-3 shadow-[0_32px_80px_rgba(20,83,45,0.18)] sm:rounded-[36px] sm:p-4 lg:ml-auto lg:rounded-[40px] lg:p-5"
                >
                  <div className="absolute left-5 top-5 z-20 rounded-full border border-white/80 bg-white/94 px-4 py-2 text-xs font-semibold text-[#14532D] shadow-[0_14px_30px_rgba(20,83,45,0.14)] sm:left-6 sm:top-6 sm:text-sm lg:left-8 lg:top-8">
                    {t("landing.hero.verifiedSupplyChain")}
                  </div>

                  <HeroVideoCard />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative mt-4 w-fit max-w-[calc(100%-1rem)] rounded-[20px] border border-white/92 bg-white/97 p-4 shadow-[0_20px_48px_rgba(20,83,45,0.16)] sm:rounded-[24px] lg:absolute lg:-bottom-2 lg:left-8 lg:mt-0"
                >
                  <p className="text-sm font-semibold text-[#14532D]">{t("landing.hero.freshToday")}</p>
                  <p className="mt-0.5 text-xs text-[#5F6F64] sm:mt-1 sm:text-sm">{t("landing.hero.deliveredFromFarm")}</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="agrivo-section">
          <div className="agrivo-container">
            <div className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]"
              >
                {t("nav.marketplace")}
              </motion.p>
              <motion.h2
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="agrivo-heading agrivo-section-title text-[#102018]"
              >
                {t("home.shopByCategory")}
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base"
              >
                {t("home.shopByCategoryDesc")}
              </motion.p>
            </div>

            <div className="agrivo-category-grid">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.name}
                    initial="hidden"
                    whileInView="show"
                    viewport={categoryViewport}
                    variants={categoryReveal}
                    transition={{
                      duration: 0.65,
                      delay: 0.35 + index * 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Card
                      className={`agrivo-category-card agrivo-card cursor-pointer rounded-[28px] border border-transparent ${category.accent} shadow-[0_10px_24px_rgba(15,23,42,0.04)]`}
                      onClick={() => goToPage("products")}
                    >
                      <CardContent className="flex items-center gap-4 p-5 sm:p-6">
                        <div className="agrivo-category-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 sm:h-16 sm:w-16">
                          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${category.iconTint}`} />
                        </div>
                        <div className="min-w-0 text-left">
                          <h3 className="text-lg font-semibold text-[#102018]">{category.name}</h3>
                          <p className="mt-1 text-sm text-[#5F6F64]">{category.subtitle}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        <HowItWorksSection />

        <section className="agrivo-section">
          <div className="agrivo-container">
            <div className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]"
              >
                {t("home.trustedGrowers")}
              </motion.p>
              <motion.h2
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="agrivo-heading agrivo-section-title text-[#102018]"
              >
                {t("home.featuredFarmersTitle")}
              </motion.h2>
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={categoryViewport}
                variants={categoryReveal}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base"
              >
                {t("home.featuredFarmersDesc")}
              </motion.p>
            </div>

            <div className="agrivo-farmer-grid">
              {featuredFarmers.map((farmer, index) => (
                <motion.div
                  key={farmer.slug}
                  initial="hidden"
                  whileInView="show"
                  viewport={categoryViewport}
                  variants={categoryReveal}
                  transition={{
                    duration: 0.65,
                    delay: 0.35 + index * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <FeaturedFarmerCard farmer={farmer} onViewProfile={goToFarmerProfile} />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={categoryViewport}
              variants={categoryReveal}
              transition={{ duration: 0.65, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex justify-center"
            >
              <Button
                variant="outline"
                size="lg"
                className="agrivo-button-soft rounded-full border-[#14532D] bg-white px-8 text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={() => goToPage("farmers")}
              >
                {t("farmers.seeAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="agrivo-section bg-white">
          <div className="agrivo-container">
            <div className="agrivo-reveal">
              <SectionIntro
                eyebrow={t("home.featuredSupply")}
                title={t("home.featuredProductsTitle")}
                description={t("home.featuredProductsDesc")}
              />
            </div>
            <div className="agrivo-product-grid agrivo-product-grid--featured">
              {products.map((product) => (
                <div key={product.name} className="agrivo-product-grid-item h-full">
                  <FeaturedProductCard
                    product={product}
                    onViewDetails={() => {
                      if (product.slug) {
                        navigateToHash(getProductDetailHash(product.slug));
                        return;
                      }
                      goToPage("marketplace");
                    }}
                    onContactSeller={() => goToPage("login")}
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                className="agrivo-button-soft rounded-full border-[#14532D] bg-white px-8 text-[#14532D] hover:bg-[#EAF7EC]"
                onClick={() => goToPage("marketplace")}
              >
                {t("home.seeAllProducts")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section id="traceability" className="agrivo-section agrivo-traceability-section agrivo-scroll-anchor bg-[#f8faf4]">
          <div className="agrivo-container">
            <div className="agrivo-reveal mx-auto mb-10 max-w-2xl text-center md:mb-12">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]">
                {t("landing.traceability.eyebrow")}
              </p>
              <h2 className="agrivo-heading agrivo-section-title text-[#102018]">
                {t("landing.traceability.title")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base">
                {t("landing.traceability.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <Card className="agrivo-reveal overflow-hidden rounded-[24px] border border-[#dbe7d4] bg-[#14532d] text-white shadow-[0_24px_70px_rgba(20,83,45,0.18)] sm:rounded-[32px]">
                <CardContent className="flex h-full flex-col p-5 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86efac] sm:text-sm sm:tracking-[0.24em]">
                    {t("landing.traceability.cardEyebrow")}
                  </p>
                  <h3 className="agrivo-heading mt-3 text-2xl font-bold leading-tight text-white sm:mt-4 sm:text-3xl">
                    {t("landing.traceability.cardTitle")}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#d1fae5] sm:mt-4 sm:text-base">
                    {t("landing.traceability.cardDescription")}
                  </p>

                  <div className="agrivo-trace-timeline mt-6 sm:mt-8">
                    {traceabilityStages.map((stage, index) => {
                      const isActive = stage === deliveredStageLabel;
                      const isComplete = index < traceabilityStages.length - 1;

                      return (
                        <div key={stage} className="agrivo-trace-timeline-item">
                          <span
                            className={`agrivo-trace-timeline-pill ${isActive ? "agrivo-trace-timeline-pill--active" : isComplete ? "agrivo-trace-timeline-pill--done" : ""}`}
                          >
                            {stage}
                          </span>
                          {index < traceabilityStages.length - 1 ? (
                            <ChevronRight className="agrivo-trace-timeline-arrow hidden h-4 w-4 shrink-0 text-[#86efac] sm:block" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="agrivo-reveal rounded-[24px] border border-[#dbe7d4] bg-white shadow-[0_12px_32px_rgba(20,83,45,0.06)] sm:rounded-[32px]">
                <CardContent className="flex h-full flex-col p-5 sm:p-8">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5]">
                        <Package className="h-5 w-5 text-[#14532d]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#5F6F64]">
                          {t("landing.traceability.batchId")}
                        </p>
                        <h3 className="text-xl font-bold text-[#102018] sm:text-2xl">AGR-TOM-24051</h3>
                      </div>
                    </div>
                    <Badge className="rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534] hover:bg-[#ecfdf5]">
                      {t("landing.traceability.delivered")}
                    </Badge>
                  </div>

                  <div className="agrivo-batch-details-grid grid flex-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {batchDetails.map((detail) => (
                      <div key={detail.label} className="rounded-[18px] border border-[#edf2ea] bg-[#f8faf4] px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#7a8b80]">{detail.label}</p>
                        <p className="mt-1 text-sm font-semibold leading-snug text-[#102018] sm:text-base">
                          {detail.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 rounded-[18px] border border-dashed border-[#bbf7d0] bg-[#f6fbf4] px-4 py-3 text-sm leading-6 text-[#3f5247]">
                    {t("landing.traceability.note")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="agrivo-reveal mx-auto mt-14 max-w-2xl text-center md:mt-16">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d] sm:mb-3 sm:text-sm sm:tracking-[0.24em]">
                {t("landing.marketSignals.eyebrow")}
              </p>
              <h3 className="agrivo-heading text-2xl font-bold text-[#102018] sm:text-3xl">
                {t("landing.marketSignals.title")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5F6F64] sm:mt-4 sm:text-base">
                {t("landing.marketSignals.subtitle")}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-6">
              {marketInsights.map((insight) => {
                const Icon = insight.icon;

                return (
                  <Card
                    key={insight.id}
                    className="agrivo-insight-card agrivo-card rounded-[28px] border border-[#e5efe1] bg-white shadow-[0_10px_28px_rgba(20,83,45,0.05)]"
                  >
                    <CardContent className="flex h-full flex-col p-6 sm:p-7">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f7ee]">
                          <Icon className="h-5 w-5 text-[#14532d]" strokeWidth={1.75} />
                        </div>
                        <Badge className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold hover:opacity-100 ${insight.tone}`}>
                          {insight.value}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-bold text-[#102018] sm:text-xl">{insight.label}</h4>
                      <p className="mt-2 flex-1 text-sm leading-6 text-[#5F6F64]">{insight.description}</p>

                      {insight.indicator === "trend" ? (
                        <div className="agrivo-insight-trend mt-5 flex items-end gap-1.5 pt-1">
                          {[40, 52, 48, 64, 72, 88].map((height, index) => (
                            <span
                              key={index}
                              className="agrivo-insight-trend-bar w-3 rounded-t-md bg-[#86efac]"
                              style={{ height: `${height}%`, maxHeight: "2.5rem" }}
                            />
                          ))}
                          <TrendingUp className="ml-1 h-4 w-4 shrink-0 text-[#15803d]" />
                        </div>
                      ) : null}

                      {insight.indicator === "progress" && insight.progress ? (
                        <div className="mt-5">
                          <div className="h-2 overflow-hidden rounded-full bg-[#eef4ea]">
                            <div
                              className="h-full rounded-full bg-[#43A047]"
                              style={{ width: `${insight.progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs font-medium text-[#6b7a70]">{t("landing.marketSignals.onTimeRoutes")}</p>
                        </div>
                      ) : null}

                      {insight.indicator === "status" ? (
                        <div className="mt-5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#166534]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {t("landing.marketSignals.lowSpoilageRisk")}
                          </span>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#14532d] py-12 text-white sm:py-16">
        <div className="agrivo-container">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 xl:grid-cols-5">
            <div className="agrivo-reveal">
              <a
                href="#home"
                className="footer-logo mb-6 inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("home", "top");
                }}
              >
                <img src={agrivoLogoFooter} alt="Agrivo" width={170} height={48} decoding="async" />
              </a>
              <p className="max-w-sm text-sm leading-7 text-[#d1fae5]">
                {t("footer.tagline")}
              </p>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.platform")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("products")}>{t("nav.marketplace")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("farmers")}>{t("nav.farmers")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("logistics")}>{t("nav.logistics")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToSection("traceability")}>{t("footer.traceability")}</button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.company")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>{t("footer.about")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("products")}>{t("footer.blog")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("farmers")}>{t("footer.contact")}</button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.support")}</h3>
              <div className="mt-4 space-y-3 text-sm text-[#d1fae5]">
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("login")}>{t("footer.helpCenter")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToSection("how-it-works")}>{t("footer.faq")}</button>
                <button className="block transition-colors hover:text-white" onClick={() => goToPage("login")}>{t("footer.privacy")}</button>
              </div>
            </div>

            <div className="agrivo-reveal">
              <h3 className="text-lg font-semibold">{t("footer.newsletter")}</h3>
              <p className="mt-4 text-sm leading-7 text-[#d1fae5]">{t("footer.newsletterDesc")}</p>
              <div className="mt-5 flex w-full max-w-sm flex-col gap-3 sm:flex-row lg:max-w-none lg:flex-col">
                <Input type="email" placeholder={t("footer.yourEmail")} className="h-11 w-full rounded-full border-white/15 bg-white/10 text-white placeholder:text-[#bbf7d0] focus-visible:ring-1 focus-visible:ring-white sm:h-12" />
                <Button className="agrivo-button-soft h-11 w-full rounded-full bg-[#43A047] text-white hover:bg-[#4CAF50] sm:h-12 sm:w-auto lg:w-full">{t("footer.subscribe")}</Button>
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

