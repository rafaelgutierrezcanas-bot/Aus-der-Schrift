import type { Metadata } from "next";
import { absoluteUrl, localePath, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = localePath(locale, "/impressum");

  return {
    title: locale === "de" ? "Impressum" : "Legal Notice",
    description: locale === "de" ? "Impressum von Theologik." : "Legal notice for Theologik.",
    alternates: {
      canonical: path,
    },
    openGraph: {
      url: absoluteUrl(path),
      title: locale === "de" ? "Impressum" : "Legal Notice",
      description: locale === "de" ? "Impressum von Theologik." : "Legal notice for Theologik.",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
    },
    robots: { index: true, follow: true },
  };
}

export default function ImpressumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
