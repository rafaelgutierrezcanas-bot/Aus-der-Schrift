import { notFound } from "next/navigation";
import { loadUnitBySlug } from "@/lib/bibelstudium/content-loader";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ locale: string; unitSlug: string }>;
}) {
  const { unitSlug } = await params;

  let unit;
  try {
    unit = loadUnitBySlug(unitSlug);
  } catch (e) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1>Error loading unit</h1>
        <pre>{String(e)}</pre>
      </div>
    );
  }

  if (!unit) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1>{unit.meta.title}</h1>
      <p>Stationen: {unit.stations.length}</p>
      <p>Type: {unit.stations[0]?.type}</p>
    </div>
  );
}
