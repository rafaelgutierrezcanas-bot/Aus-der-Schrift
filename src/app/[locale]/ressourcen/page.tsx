import Link from "next/link";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

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
    keywords: [
      "theologische Ressourcen",
      "Theologie Bücher",
      "theologische Zitate",
      "Bibelauslegung",
      "Hermeneutik",
    ],
  });
}

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const sections = [
    {
      key: "buecher",
      href: `/${locale}/ressourcen/buecher`,
      labelDe: "Bücher",
      labelEn: "Books",
      descDe: "Empfehlenswerte theologische Bücher — ausgewählt und eingeordnet nach Thema und Schwierigkeitsgrad. Von Einführungen bis zu wissenschaftlichen Werken.",
      descEn: "Recommended theological books — selected and organized by topic and difficulty. From introductions to scholarly works.",
      linkDe: "Bücher durchstöbern",
      linkEn: "Browse books",
    },
    {
      key: "zitate",
      href: `/${locale}/ressourcen/zitate`,
      labelDe: "Zitate",
      labelEn: "Quotes",
      descDe: "Theologische Zitate bedeutender Denker und Autoren — gesammelt nach Thema. Für Inspiration, Meditation und das Gespräch mit der Tradition.",
      descEn: "Theological quotes from significant thinkers and authors — organized by topic. For inspiration, meditation, and dialogue with tradition.",
      linkDe: "Zitate entdecken",
      linkEn: "Discover quotes",
    },
    {
      key: "ausarbeitungen",
      href: `/${locale}/ressourcen/ausarbeitungen`,
      labelDe: "Ausarbeitungen",
      labelEn: "Papers",
      descDe: "Eigene theologische Ausarbeitungen und Studien zu ausgewählten Themen — als PDF zum Lesen und Weiterdenken.",
      descEn: "My own theological papers and studies on selected topics — as PDF for reading and further reflection.",
      linkDe: "Studien lesen",
      linkEn: "Read papers",
    },
  ];

  const hermeneutikEnabled = process.env.NEXT_PUBLIC_HERMENEUTIK_ENABLED === "true";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Page header — matching blog/category/projekte */}
      <div className="mb-12">
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
          className="group block mb-12 pb-12 border-b border-border"
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

      {/* Resource sections — editorial rows */}
      <div>
        {sections.map((section) => (
          <Link
            key={section.key}
            href={section.href}
            className="group block py-8 border-b border-border last:border-0"
          >
            <div className="md:grid md:grid-cols-[220px_1fr] md:gap-12 md:items-start">
              {/* Title column */}
              <div>
                <h2
                  className="text-2xl font-bold leading-tight mb-1 group-hover:text-accent transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {locale === "de" ? section.labelDe : section.labelEn}
                </h2>
              </div>

              {/* Description + link column */}
              <div>
                <p
                  className="text-muted leading-relaxed mb-4"
                  style={{ fontFamily: "var(--font-body-serif)" }}
                >
                  {locale === "de" ? section.descDe : section.descEn}
                </p>
                <span
                  className="text-xs text-accent"
                  style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.06em" }}
                >
                  {locale === "de" ? section.linkDe : section.linkEn} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
