import type { Metadata } from "next";
import { absoluteUrl, localePath } from "@/lib/site";

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
    },
  };
}

export default function ImpressumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
