import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { HermeneutikNav } from "@/components/hermeneutik/HermeneutikNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen/hermeneutik",
    deTitle: "Hermeneutik lernen",
    enTitle: "Learn Hermeneutics",
    deDescription:
      "Interaktives Lernprogramm für biblische Hermeneutik — lerne Bibeltexte methodisch zu analysieren.",
    enDescription:
      "Interactive learning program for biblical hermeneutics — learn to analyze Bible texts methodically.",
  });
}

export default function HermeneutikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <HermeneutikNav />
      {children}
    </div>
  );
}
