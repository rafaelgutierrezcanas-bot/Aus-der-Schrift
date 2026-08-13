import Link from "next/link";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { client } from "@/sanity/client";

export const revalidate = 60;

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
      "Empfehlenswerte theologische Bücher, Zitate bedeutender Denker und eigene Ausarbeitungen zu Theologie und Bibelauslegung.",
    enDescription:
      "Recommended theological books, quotes from significant thinkers, and original papers on theology and biblical interpretation.",
  });
}

/* ── SVG icons ── */

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three book spines side by side */}
      <rect x="8" y="6" width="8" height="36" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="8" width="7" height="34" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="27" y="4" width="9" height="38" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Spine lines */}
      <line x1="12" y1="12" x2="12" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="21.5" y1="14" x2="21.5" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="31.5" y1="10" x2="31.5" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      {/* Leaning book */}
      <rect x="34" y="10" width="8" height="32" rx="1.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(8 38 26)" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Large decorative opening quotation marks */}
      <path d="M10 28c0-6 4-12 10-14l1 2c-4 2-6 5-6 8h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-5z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M27 28c0-6 4-12 10-14l1 2c-4 2-6 5-6 8h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-5z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document with folded corner */}
      <path d="M12 6h16l10 10v26a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 6v8a2 2 0 0 0 2 2h8" stroke="currentColor" strokeWidth="1.5" />
      {/* Text lines */}
      <line x1="18" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <line x1="18" y1="27" x2="30" y2="27" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <line x1="18" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

function InfographicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Frame */}
      <rect x="6" y="8" width="36" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Bar chart inside */}
      <rect x="12" y="26" width="5" height="8" rx="0.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <rect x="20" y="20" width="5" height="14" rx="0.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      <rect x="28" y="16" width="5" height="18" rx="0.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1" />
      {/* Trend line */}
      <polyline points="14.5,24 22.5,18 30.5,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons: Record<string, (props: { className?: string }) => React.ReactNode> = {
  buecher: BookIcon,
  zitate: QuoteIcon,
  ausarbeitungen: PaperIcon,
  infografiken: InfographicIcon,
};

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch all counts in one round-trip
  const counts = await client.fetch<{
    buecher: number;
    zitate: number;
    ausarbeitungen: number;
    infografiken: number;
  }>(
    `{
      "buecher": count(*[_type == "bookRecommendation"]),
      "zitate": count(*[_type == "quote"]),
      "ausarbeitungen": count(*[_type == "ausarbeitung"]),
      "infografiken": count(*[_type == "infografik"])
    }`,
    {},
    { next: { tags: ["ressourcen"], revalidate: 60 } }
  );

  const sections = [
    {
      key: "buecher" as const,
      href: `/${locale}/ressourcen/buecher`,
      labelDe: "Bücher",
      labelEn: "Books",
      countLabelDe: "Bücher",
      countLabelEn: "Books",
      descDe: "Ausgewählt und eingeordnet nach Thema und Schwierigkeitsgrad — von Einführungen bis zu wissenschaftlichen Werken.",
      descEn: "Selected and organized by topic and difficulty — from introductions to scholarly works.",
      linkDe: "Durchstöbern",
      linkEn: "Browse",
    },
    {
      key: "zitate" as const,
      href: `/${locale}/ressourcen/zitate`,
      labelDe: "Zitate",
      labelEn: "Quotes",
      countLabelDe: "Zitate",
      countLabelEn: "Quotes",
      descDe: "Theologische Zitate bedeutender Denker und Autoren — gesammelt nach Thema, für Inspiration und das Gespräch mit der Tradition.",
      descEn: "Theological quotes from significant thinkers — organized by topic, for inspiration and dialogue with tradition.",
      linkDe: "Entdecken",
      linkEn: "Discover",
    },
    {
      key: "ausarbeitungen" as const,
      href: `/${locale}/ressourcen/ausarbeitungen`,
      labelDe: "Ausarbeitungen",
      labelEn: "Papers",
      countLabelDe: "Studien",
      countLabelEn: "Papers",
      descDe: "Eigene theologische Ausarbeitungen und Studien — als PDF zum Lesen und Weiterdenken.",
      descEn: "Original theological papers and studies — as PDF for reading and further reflection.",
      linkDe: "Lesen",
      linkEn: "Read",
    },
    {
      key: "infografiken" as const,
      href: `/${locale}/ressourcen/infografiken`,
      labelDe: "Infografiken",
      labelEn: "Infographics",
      countLabelDe: "Grafiken",
      countLabelEn: "Graphics",
      descDe: "Übersichtlich aufbereitete Infografiken zu verschiedenen Themen — frei verwendbar mit Quellenangabe.",
      descEn: "Clearly presented infographics on various topics — free to use with attribution.",
      linkDe: "Ansehen",
      linkEn: "View",
    },
  ];

  const hermeneutikEnabled = process.env.NEXT_PUBLIC_HERMENEUTIK_ENABLED === "true";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Page header */}
      <div className="mb-14">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <p
          className="text-xs uppercase tracking-[0.15em] text-accent mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Weiterführendes" : "Further Reading"}
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Ressourcen" : "Resources"}
        </h1>
        <p
          className="text-muted text-lg leading-relaxed max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Empfehlenswerte Bücher, theologische Zitate und eigene Ausarbeitungen — zusammengestellt für das weitere Studium."
            : "Recommended books, theological quotes, and my own papers — compiled for further study."}
        </p>
      </div>

      {/* Hermeneutik feature — accent left border treatment */}
      {hermeneutikEnabled && (
        <Link
          href={`/${locale}/ressourcen/hermeneutik`}
          className="group block mb-14 pb-12 border-b border-border"
        >
          <div className="border-l-2 border-accent pl-5">
            <p
              className="text-[10px] uppercase tracking-widest text-accent mb-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Interaktives Programm" : "Interactive Program"}
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {locale === "de" ? "Hermeneutik lernen" : "Learn Hermeneutics"}
            </h2>
            <p
              className="text-muted leading-relaxed max-w-prose mb-3"
              style={{ fontFamily: "var(--font-body-serif)" }}
            >
              {locale === "de"
                ? "Interaktives Lernprogramm für biblische Textanalyse — lerne die hermeneutische Methode Schritt für Schritt anhand echter Bibeltexte."
                : "Interactive learning program for biblical text analysis — learn the hermeneutical method step by step using real Bible texts."}
            </p>
            <span
              className="text-xs text-accent"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Zum Programm →" : "Open program →"}
            </span>
          </div>
        </Link>
      )}

      {/* Resource cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((section) => {
          const Icon = icons[section.key];
          const count = counts[section.key] ?? 0;

          return (
            <Link
              key={section.key}
              href={section.href}
              className="group relative border border-border rounded-sm p-6 hover:border-accent/40 transition-colors"
            >
              {/* Icon */}
              <div className="mb-5">
                <Icon className="w-12 h-12 text-accent/60 group-hover:text-accent transition-colors" />
              </div>

              {/* Count badge */}
              <p
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
              >
                {count}{" "}
                <span className="text-base font-normal text-muted">
                  {locale === "de" ? section.countLabelDe : section.countLabelEn}
                </span>
              </p>

              {/* Title */}
              <h2
                className="text-lg font-bold mb-2 group-hover:text-accent transition-colors"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {locale === "de" ? section.labelDe : section.labelEn}
              </h2>

              {/* Description */}
              <p
                className="text-sm text-muted leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                {locale === "de" ? section.descDe : section.descEn}
              </p>

              {/* Link */}
              <span
                className="text-xs text-accent"
                style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.06em" }}
              >
                {locale === "de" ? section.linkDe : section.linkEn} →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
