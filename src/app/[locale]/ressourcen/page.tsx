import Link from "next/link";

export const revalidate = 60;

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
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

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-6">
        <Link
          href={`/${locale}/ressourcen/buecher`}
          className="group block rounded-2xl border p-8 transition-all hover:scale-[1.01]"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Bücher" : "Books"}
          </h2>
          <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
            {locale === "de"
              ? "Empfehlenswerte theologische Bücher mit Einordnung nach Thema und Schwierigkeitsgrad."
              : "Recommended theological books categorized by topic and difficulty level."}
          </p>
        </Link>

        <Link
          href={`/${locale}/ressourcen/zitate`}
          className="group block rounded-2xl border p-8 transition-all hover:scale-[1.01]"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Zitate" : "Quotes"}
          </h2>
          <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
            {locale === "de"
              ? "Theologische Zitate bedeutender Autoren und Denker, nach Thema geordnet."
              : "Theological quotes from significant authors and thinkers, organized by topic."}
          </p>
        </Link>

        <Link
          href={`/${locale}/ressourcen/ausarbeitungen`}
          className="group block rounded-2xl border p-8 transition-all hover:scale-[1.01]"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {locale === "de" ? "Ausarbeitungen" : "Papers"}
          </h2>
          <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
            {locale === "de"
              ? "Eigene theologische Ausarbeitungen und Studien zu ausgewählten Themen."
              : "My own theological papers and studies on selected topics."}
          </p>
        </Link>
      </div>
    </div>
  );
}
