import Link from "next/link";

export const revalidate = 60;

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Weiterführendes" : "Further Reading"}
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Ressourcen
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Hier findest du empfehlenswerte Bücher, theologische Zitate und eigene Ausarbeitungen."
          : "Here you will find recommended books, theological quotes, and my own papers."}
      </p>

      {/* Hermeneutik Program — only shown when enabled */}
      {process.env.NEXT_PUBLIC_HERMENEUTIK_ENABLED === "true" && (
        <Link
          href={`/${locale}/ressourcen/hermeneutik`}
          className="group block rounded-2xl border p-8 mb-12 transition-all hover:scale-[1.01]"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {locale === "de" ? "Hermeneutik lernen" : "Learn Hermeneutics"}
          </h2>
          <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
            {locale === "de"
              ? "Interaktives Lernprogramm für biblische Textanalyse — lerne die hermeneutische Methode Schritt für Schritt."
              : "Interactive learning program for biblical text analysis — learn the hermeneutical method step by step."}
          </p>
        </Link>
      )}

      {/* Category cards — 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bücher */}
        <Link
          href={`/${locale}/ressourcen/buecher`}
          className="group flex flex-col rounded-2xl border p-8 transition-all hover:scale-[1.01] hover:shadow-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="mb-4 text-[var(--color-muted)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Bücher" : "Books"}
          </h2>
          <p
            className="text-sm leading-relaxed flex-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
          >
            {locale === "de"
              ? "Empfehlenswerte theologische Bücher mit Einordnung nach Thema und Schwierigkeitsgrad."
              : "Recommended theological books categorized by topic and difficulty level."}
          </p>
          <p
            className="text-xs mt-4 transition-colors group-hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Bücher durchstöbern →" : "Browse books →"}
          </p>
        </Link>

        {/* Zitate — highlighted */}
        <Link
          href={`/${locale}/ressourcen/zitate`}
          className="group flex flex-col rounded-2xl border p-8 transition-all hover:scale-[1.01] hover:shadow-sm"
          style={{ borderColor: "var(--color-accent)", background: "var(--color-surface)" }}
        >
          <div className="mb-4">
            <span
              className="text-4xl leading-none select-none"
              style={{ color: "var(--color-accent)", fontFamily: "var(--font-serif)" }}
            >
              &ldquo;
            </span>
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Zitate" : "Quotes"}
          </h2>
          <p
            className="text-sm leading-relaxed flex-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
          >
            {locale === "de"
              ? "Theologische Zitate bedeutender Autoren und Denker, nach Thema geordnet."
              : "Theological quotes from significant authors and thinkers, organized by topic."}
          </p>
          <p
            className="text-xs mt-4 transition-colors"
            style={{ color: "var(--color-accent)", fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Zitate entdecken →" : "Discover quotes →"}
          </p>
        </Link>

        {/* Ausarbeitungen */}
        <Link
          href={`/${locale}/ressourcen/ausarbeitungen`}
          className="group flex flex-col rounded-2xl border p-8 transition-all hover:scale-[1.01] hover:shadow-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="mb-4 text-[var(--color-muted)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Ausarbeitungen" : "Papers"}
          </h2>
          <p
            className="text-sm leading-relaxed flex-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
          >
            {locale === "de"
              ? "Eigene theologische Ausarbeitungen und Studien zu ausgewählten Themen."
              : "My own theological papers and studies on selected topics."}
          </p>
          <p
            className="text-xs mt-4 transition-colors group-hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Studien lesen →" : "Read papers →"}
          </p>
        </Link>
      </div>
    </div>
  );
}
