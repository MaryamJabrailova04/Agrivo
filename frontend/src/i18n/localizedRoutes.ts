import type { Language } from "./translations";

const STORAGE_KEY = "agrivo_language";

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "az";
}

export function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // ignore
  }
  return "en";
}

export type ParsedHash = {
  language: Language | null;
  path: string;
};

export function normalizeRoutePath(path: string): string {
  const trimmed = path.replace(/^#\/?/, "").replace(/^\//, "");
  if (!trimmed) return "home";
  const withoutLang = trimmed.replace(/^(az|en)\/?/, "");
  return withoutLang || "home";
}

export function getRoutePathFromHash(rawHash?: string): string {
  return normalizeRoutePath(rawHash ?? window.location.hash);
}

export function parseHash(rawHash: string): ParsedHash {
  const normalized = rawHash.replace(/^#/, "") || "home";
  const clean = normalized.replace(/^\//, "");
  const match = clean.match(/^(az|en)(?:\/(.*))?$/);

  if (match) {
    return {
      language: match[1] as Language,
      path: match[2] || "home",
    };
  }

  return {
    language: null,
    path: clean || "home",
  };
}

export function buildHash(language: Language, path: string): string {
  const cleanPath = normalizeRoutePath(path);
  return `#/${language}/${cleanPath}`;
}

export function getLanguageFromHash(rawHash: string): Language | null {
  return parseHash(rawHash).language;
}

export function navigateToHash(path: string, language?: Language): void {
  const lang = language ?? getLanguageFromHash(window.location.hash) ?? readStoredLanguage();
  window.location.hash = buildHash(lang, path);
}

export function replaceHash(path: string, language?: Language): void {
  const lang = language ?? getLanguageFromHash(window.location.hash) ?? readStoredLanguage();
  window.location.replace(buildHash(lang, path));
}
