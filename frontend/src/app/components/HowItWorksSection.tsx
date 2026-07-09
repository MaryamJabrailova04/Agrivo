import { BadgeCheck, ImageIcon, Sprout, Store, Truck, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import howItWorksStep1 from "../../assets/how-it-works-step-1.png";
import howItWorksStep2 from "../../assets/how-it-works-step-2.png";
import howItWorksStep3 from "../../assets/how-it-works-step-3.png";
import howItWorksStep4 from "../../assets/how-it-works-step-4.png";
import { useLanguage } from "../../i18n/LanguageContext";

const viewport = { once: true, amount: 0.2 } as const;

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

type StepKey = "farmerLists" | "buyerOrders" | "batchTracked" | "deliveryCompleted";

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  imageAlt: string;
};

const stepMeta: Array<{
  step: number;
  key: StepKey;
  icon: LucideIcon;
  image: string;
}> = [
  { step: 1, key: "farmerLists", icon: Sprout, image: howItWorksStep1 },
  { step: 2, key: "buyerOrders", icon: Store, image: howItWorksStep2 },
  { step: 3, key: "batchTracked", icon: BadgeCheck, image: howItWorksStep3 },
  { step: 4, key: "deliveryCompleted", icon: Truck, image: howItWorksStep4 },
];

function StepCard({ step, index, stepLabel }: { step: HowItWorksStep; index: number; stepLabel: string }) {
  const Icon = step.icon;
  const { t } = useLanguage();

  return (
    <motion.article
      className="agrivo-step-card"
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={reveal}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="agrivo-step-card-body">
        <div className="agrivo-step-card-head">
          <div className="agrivo-step-icon">
            <Icon className="h-5 w-5 text-[#14532D]" strokeWidth={2} />
          </div>
          <p className="agrivo-step-label">
            {stepLabel} {String(step.step).padStart(2, "0")}
          </p>
        </div>

        <h3 className="agrivo-step-title">{step.title}</h3>
        <p className="agrivo-step-description">{step.description}</p>
      </div>

      <div className="agrivo-step-image">
        {step.image ? (
          <img src={step.image} alt={step.imageAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="agrivo-step-image-placeholder" aria-hidden>
            <ImageIcon className="h-6 w-6 text-[#7a9a82]" strokeWidth={1.75} />
            <span>{t("landing.howItWorks.imagePlaceholder")}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function HowItWorksSection() {
  const { t } = useLanguage();

  const howItWorksSteps = useMemo<HowItWorksStep[]>(
    () =>
      stepMeta.map((item) => ({
        step: item.step,
        title: t(`landing.howItWorks.steps.${item.key}.title`),
        description: t(`landing.howItWorks.steps.${item.key}.description`),
        icon: item.icon,
        image: item.image,
        imageAlt: t(`landing.howItWorks.steps.${item.key}.imageAlt`),
      })),
    [t],
  );

  const stepLabel = t("landing.howItWorks.step");

  return (
    <section id="how-it-works" className="agrivo-section agrivo-scroll-anchor agrivo-how-it-works">
      <div className="agrivo-how-it-works-bg" aria-hidden />
      <div className="agrivo-container relative">
        <motion.div
          className="agrivo-how-it-works-intro"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={reveal}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="agrivo-how-it-works-eyebrow">{t("landing.howItWorks.eyebrow")}</p>
          <h2 className="agrivo-heading agrivo-how-it-works-title">{t("landing.howItWorks.title")}</h2>
          <p className="agrivo-how-it-works-description">{t("landing.howItWorks.subtitle")}</p>
        </motion.div>

        <div className="agrivo-steps-track">
          <div className="agrivo-steps-connector" aria-hidden />
          <div className="agrivo-steps-grid">
            {howItWorksSteps.map((step, index) => (
              <StepCard key={step.step} step={step} index={index} stepLabel={stepLabel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
