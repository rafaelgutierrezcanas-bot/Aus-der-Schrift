import Link from "next/link";
import { client } from "@/sanity/client";
import { RessourcenClient } from "@/components/RessourcenClient";

export const revalidate = 60;

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [books, quotes] = await Promise.all([
    client.fetch(
      `*[_type == "bookRecommendation"] | order(_createdAt desc) {
        _id, title, author, year, description, difficulty, topics, buyLink
      }`,
      {},
      { next: { tags: ["ressourcen"], revalidate: 60 } }
    ),
    client.fetch(
      `*[_type == "quote"] | order(_createdAt desc) {
        _id, text, author, topics,
        "source": source->{ title, author, year }
      }`,
      {},
      { next: { tags: ["ressourcen"], revalidate: 60 } }
    ),
  ]);

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
          ? "Hier findest du eine Auswahl empfehlenswerter Bücher und theologischer Zitate."
          : "Here you will find a selection of recommended books and theological quotes."}
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

      <RessourcenClient books={books} quotes={quotes} locale={locale} />
    </div>
  );
}
