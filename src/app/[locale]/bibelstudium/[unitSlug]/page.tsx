import { notFound } from "next/navigation";
import { loadUnitBySlug, loadAllUnits, loadBibliography } from "@/lib/bibelstudium/content-loader";
import { UnitView } from "@/components/bibelstudium/UnitView";
import type { Metadata } from "next";
import type { BracketData, BibliographyEntry } from "@/lib/bibelstudium/types";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const units = loadAllUnits();
  return units.map((u) => ({ unitSlug: u.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; unitSlug: string }>;
}): Promise<Metadata> {
  const { locale, unitSlug } = await params;
  const unit = loadUnitBySlug(unitSlug);

  if (!unit) {
    return {};
  }

  return buildLocalizedMetadata({
    locale,
    pathname: `/bibelstudium/${unitSlug}`,
    deTitle: unit.meta.title,
    enTitle: unit.meta.title,
    deDescription: unit.meta.description,
    enDescription: unit.meta.description,
  });
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ locale: string; unitSlug: string }>;
}) {
  const { unitSlug } = await params;
  const unit = loadUnitBySlug(unitSlug);

  if (!unit) {
    notFound();
  }

  // Bracket states will be loaded client-side in a future iteration
  // (cookies + Redis make the page dynamic, breaking fs reads on Vercel)
  const bracketStates: Record<string, BracketData | null> = {};

  const bibEntries = loadBibliography();
  const bibMap: Record<string, BibliographyEntry> = {};
  for (const entry of bibEntries) {
    bibMap[entry.id] = entry;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <UnitView
        unit={unit}
        bracketStates={bracketStates}
        bibMap={bibMap}
      />
    </div>
  );
}
