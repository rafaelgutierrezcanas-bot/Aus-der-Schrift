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
    pathname: "/bibelstudium",
    deTitle: "Bibelstudium",
    enTitle: "Bible Study",
    deDescription:
      "Interaktive Lerneinheiten zum methodischen Bibelstudium — Stationen, Übungen und Methoden für ein fundiertes Verständnis der Heiligen Schrift.",
    enDescription:
      "Interactive study units for methodical Bible study — stations, exercises, and methods for a solid understanding of Holy Scripture.",
  });
}

export default function BibelstudiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
