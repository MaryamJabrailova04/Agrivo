import { useLanguage } from "../../../../i18n/LanguageContext";
import { cn } from "../../ui/utils";

export function ProfileCompletionBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className={cn("agrivo-farmer-dash-completion", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#102018]">
          {t("farmerDashboardProfile.profileCompletion")}
        </p>
        <p className="text-sm font-bold text-[#14532D]">{percent}%</p>
      </div>
      <div className="agrivo-farmer-dash-completion-track mt-2">
        <span
          className="agrivo-farmer-dash-completion-fill"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
