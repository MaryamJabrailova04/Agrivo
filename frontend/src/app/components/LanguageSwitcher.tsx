import { Languages } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/translations";
import { cn } from "./ui/utils";

const OPTIONS: Array<{ code: Language; short: string }> = [
  { code: "en", short: "EN" },
  { code: "az", short: "AZ" },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: "segmented" | "compact";
}

export function LanguageSwitcher({ className, variant = "segmented" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  if (variant === "compact") {
    return (
      <div
        className={cn("agrivo-lang-switcher agrivo-lang-switcher--compact", className)}
        role="group"
        aria-label={t("language.label")}
      >
        {OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            className={cn(
              "agrivo-lang-switcher__btn",
              language === option.code && "agrivo-lang-switcher__btn--active",
            )}
            onClick={() => setLanguage(option.code)}
            aria-pressed={language === option.code}
            title={t(`language.${option.code}`)}
          >
            {option.short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("agrivo-lang-switcher", className)}
      role="group"
      aria-label={t("language.label")}
    >
      <Languages className="agrivo-lang-switcher__icon" aria-hidden />
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          className={cn(
            "agrivo-lang-switcher__btn",
            language === option.code && "agrivo-lang-switcher__btn--active",
          )}
          onClick={() => setLanguage(option.code)}
          aria-pressed={language === option.code}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}
