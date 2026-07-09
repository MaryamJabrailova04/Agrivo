import { Star } from "lucide-react";
import { getRatingDisplay } from "../../../utils/completedDeliveriesStorage";
import { useLanguage } from "../../../../i18n/LanguageContext";
import { cn } from "../../ui/utils";

export function RatingDisplay({
  rating,
  className,
  showEmpty = false,
}: {
  rating?: number | null;
  className?: string;
  showEmpty?: boolean;
}) {
  const { t } = useLanguage();
  const { hasRating, value } = getRatingDisplay(rating);

  if (!hasRating) {
    if (!showEmpty) return null;
    return (
      <span className={cn("agrivo-completed-rating agrivo-completed-rating--empty", className)}>
        {t("completedDeliveries.rating.noRatingYet")}
      </span>
    );
  }

  return (
    <span className={cn("agrivo-completed-rating", className)}>
      <Star className="h-3.5 w-3.5 fill-[#facc15] text-[#facc15]" aria-hidden />
      {value}
    </span>
  );
}
