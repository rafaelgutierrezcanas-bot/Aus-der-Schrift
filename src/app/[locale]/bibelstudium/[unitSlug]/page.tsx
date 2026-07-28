import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { loadUnitBySlug, loadAllUnits, getBibliographyEntry } from "@/lib/bibelstudium/content-loader";
import { UnitView } from "@/components/bibelstudium/UnitView";
import { kv } from "@/lib/redis";
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

  // Read session cookie to make page dynamic
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("bs-session")?.value;

  // Load bracket states for all stations
  const bracketStates: Record<string, { content: string; date: string } | null> = {};

  if (sessionId) {
    await Promise.all(
      unit.stations.map(async (station) => {
        const data = await kv.get<{ content: string; date: string }>(
          `bracket:${sessionId}:${unitSlug}:${station.id}`
        );
        bracketStates[station.id] = data ?? null;
      })
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <UnitView
        unit={unit}
        bracketStates={bracketStates}
        getBibEntry={getBibliographyEntry}
      />
    </div>
  );
}
