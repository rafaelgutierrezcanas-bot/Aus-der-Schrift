import Link from "next/link";
import type { UnitMeta } from "@/lib/bibelstudium/types";

interface UnitOverviewProps {
  units: UnitMeta[];
  locale: string;
}

export function UnitOverview({ units, locale }: UnitOverviewProps) {
  if (units.length === 0) {
    return (
      <p
        className="text-muted text-lg"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Noch keine Lerneinheiten verfügbar."
          : "No study units available yet."}
      </p>
    );
  }

  return (
    <div>
      {units.map((unit) => (
        <Link
          key={unit.id}
          href={`/${locale}/bibelstudium/${unit.slug}`}
          className="group block py-8 border-b border-border last:border-0"
        >
          <div className="md:grid md:grid-cols-[220px_1fr] md:gap-12 md:items-start">
            <div>
              <h2
                className="text-2xl font-bold leading-tight mb-1 group-hover:text-accent transition-colors"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {unit.title}
              </h2>
              <p
                className="text-xs text-muted"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {unit.stations.length}{" "}
                {locale === "de" ? "Stationen" : "Stations"}
              </p>
            </div>

            <div>
              <p
                className="text-muted leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                {unit.description}
              </p>
              <span
                className="text-xs text-accent"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.06em",
                }}
              >
                {locale === "de" ? "Einheit starten" : "Start unit"} →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
