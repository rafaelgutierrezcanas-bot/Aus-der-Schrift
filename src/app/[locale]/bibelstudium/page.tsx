import { loadAllUnits } from "@/lib/bibelstudium/content-loader";
import { UnitOverview } from "@/components/bibelstudium/UnitOverview";

export default async function BibelstudiumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const units = loadAllUnits();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Page header */}
      <div className="mb-12">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <p
          className="text-xs uppercase tracking-[0.15em] text-accent mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Lernen" : "Learn"}
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Bibelstudium" : "Bible Study"}
        </h1>
        <p
          className="text-muted text-lg leading-relaxed max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Interaktive Lerneinheiten zum methodischen Bibelstudium — Stationen, Übungen und Methoden für ein fundiertes Verständnis der Heiligen Schrift."
            : "Interactive study units for methodical Bible study — stations, exercises, and methods for a solid understanding of Holy Scripture."}
        </p>
      </div>

      {/* Unit listing */}
      <UnitOverview units={units.map((u) => u.meta)} locale={locale} />
    </div>
  );
}
