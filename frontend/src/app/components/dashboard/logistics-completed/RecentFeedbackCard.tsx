import { Star } from "lucide-react";
import type { CompletedFeedback } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { translateFeedbackQuote } from "../../../../i18n/completedDeliveriesHelpers";

export function RecentFeedbackCard({ feedback }: { feedback: CompletedFeedback[] }) {
  const { t } = useLanguage();

  return (
    <section className="agrivo-completed-side-card agrivo-dashboard-panel">
      <h3 className="agrivo-heading text-base font-bold text-[#102018]">
        {t("completedDeliveries.sidebar.recentFeedbackTitle")}
      </h3>
      <p className="mt-1 text-xs text-[#6b7a70]">{t("completedDeliveries.sidebar.recentFeedbackSubtitle")}</p>
      <ul className="agrivo-completed-feedback-list">
        {feedback.map((item) => (
          <li key={item.id} className="agrivo-completed-feedback-item">
            <p className="text-sm font-semibold text-[#102018]">{item.buyerName}</p>
            <p className="mt-1 text-xs leading-5 text-[#5F6F64]">
              &ldquo;{translateFeedbackQuote(t, item)}&rdquo;
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#14532D]">
              <Star className="h-3 w-3 fill-[#facc15] text-[#facc15]" />
              {t("completedDeliveries.sidebar.ratingLabel")}: {item.rating.toFixed(1)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
