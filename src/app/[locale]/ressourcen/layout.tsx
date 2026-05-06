import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen",
    deTitle: "Ressourcen",
    enTitle: "Resources",
    deDescription:
      "Empfohlene Bücher, Artikel und Podcasts zu Theologie, Bibelauslegung und Kirchengeschichte auf Theologik.",
    enDescription:
      "Recommended books, articles, and podcasts on theology, biblical interpretation, and church history on Theologik.",
  });
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
