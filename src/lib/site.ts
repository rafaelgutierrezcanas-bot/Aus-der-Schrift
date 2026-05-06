export const SITE_NAME = "Theologik";
export const SITE_TITLE = "Theologik";
export const DEFAULT_LOCALE = "de";
export const SUPPORTED_LOCALES = ["de", "en"] as const;

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configured) {
    return "http://localhost:3000";
  }

  return configured.startsWith("http") ? configured : `https://${configured}`;
}

export function absoluteUrl(path = "") {
  const base = getSiteUrl().replace(/\/$/, "");
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}${normalizedPath}`;
}

export function localePath(locale: string, path = "") {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `/${locale}${normalizedPath}`;
}

export function getLocaleAlternates(path = "") {
  return {
    languages: {
      de: localePath("de", path),
      en: localePath("en", path),
      "x-default": localePath(DEFAULT_LOCALE, path),
    },
  };
}

export function buildPageTitle(locale: string, deTitle: string, enTitle: string) {
  return locale === "de" ? deTitle : enTitle;
}
