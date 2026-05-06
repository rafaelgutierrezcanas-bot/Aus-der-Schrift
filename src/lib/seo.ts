import type { Metadata } from "next";
import { absoluteUrl, buildPageTitle, getLocaleAlternates, localePath, SITE_NAME } from "@/lib/site";

export function buildLocalizedMetadata({
  locale,
  pathname = "",
  deTitle,
  enTitle,
  deDescription,
  enDescription,
  keywords = [],
  type = "website",
}: {
  locale: string;
  pathname?: string;
  deTitle: string;
  enTitle: string;
  deDescription: string;
  enDescription: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const title = buildPageTitle(locale, deTitle, enTitle);
  const description = locale === "de" ? deDescription : enDescription;
  const localizedPath = localePath(locale, pathname);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: localizedPath,
      ...getLocaleAlternates(pathname),
    },
    openGraph: {
      type,
      title,
      description,
      url: absoluteUrl(localizedPath),
      siteName: SITE_NAME,
      locale: locale === "de" ? "de_DE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
