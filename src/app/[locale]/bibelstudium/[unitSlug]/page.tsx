import { notFound } from "next/navigation";
import { loadUnitBySlug, loadAllUnits } from "@/lib/bibelstudium/content-loader";
import type { Metadata } from "next";
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1>{unit.meta.title}</h1>
      <p>Stationen: {unit.stations.length}</p>
      <pre>{JSON.stringify(unit.stations[0]?.type, null, 2)}</pre>
    </div>
  );
}
