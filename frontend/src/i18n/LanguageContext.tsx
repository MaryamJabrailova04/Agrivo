import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, type Language, type TranslationTree } from "./translations";
import {
  buildHash,
  getLanguageFromHash,
  parseHash,
  readStoredLanguage,
} from "./localizedRoutes";

const STORAGE_KEY = "agrivo_language";

function readInitialLanguage(): Language {
  const fromUrl = getLanguageFromHash(window.location.hash);
  if (fromUrl) return fromUrl;
  return readStoredLanguage();
}

function getNestedValue(tree: TranslationTree, path: string): string | undefined {
  const parts = path.split(".");
  let current: string | TranslationTree | undefined = tree;

  for (const part of parts) {
    if (!current || typeof current === "string") return undefined;
    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}

export type TranslationVars = Record<string, string | number>;
export type TranslateFn = (
  key: string,
  varsOrFallback?: TranslationVars | string,
  fallback?: string,
) => string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  setLanguageFromUrl: (language: Language) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readInitialLanguage());

  const setLanguageFromUrl = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    const { path } = parseHash(window.location.hash);
    const nextHash = buildHash(next, path);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback<TranslateFn>(
    (key, varsOrFallback, fallback) => {
      const vars: TranslationVars | undefined =
        varsOrFallback && typeof varsOrFallback === "object" ? varsOrFallback : undefined;
      const resolvedFallback = typeof varsOrFallback === "string" ? varsOrFallback : fallback;

      const localized = getNestedValue(translations[language], key);
      if (localized) {
        if (vars) {
          return Object.entries(vars).reduce((acc, [varKey, varValue]) => {
            return acc.replaceAll(`{${varKey}}`, String(varValue));
          }, localized);
        }
        return localized;
      }

      const english = getNestedValue(translations.en, key);
      if (english) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing key for ${language}: ${key}`);
        }
        if (vars) {
          return Object.entries(vars).reduce((acc, [varKey, varValue]) => {
            return acc.replaceAll(`{${varKey}}`, String(varValue));
          }, english);
        }
        return english;
      }

      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
      return resolvedFallback ?? key;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      setLanguageFromUrl,
      t,
    }),
    [language, setLanguage, setLanguageFromUrl, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
