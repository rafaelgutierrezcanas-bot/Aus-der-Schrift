import Link from "next/link";
import { client } from "@/sanity/client";
import { BuecherClient } from "@/components/BuecherClient";
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
    pathname: "/ressourcen/buecher",
    deTitle: "Theologische Bücher",
    enTitle: "Theological Books",
    deDescription:
      "Empfehlenswerte theologische Bücher nach Thema und Schwierigkeitsgrad – kuratiert von Theologik.",
    enDescription:
      "Recommended theological books sorted by topic and difficulty – curated by Theologik.",
    keywords: [
      "theologische Bücher",
      "Theologie Bücher Empfehlung",
      "christliche Literatur",
      "Bibelkommentar",
      "Apologetik Bücher",
      "Kirchengeschichte Bücher",
    ],
  });
}

export default async function BuecherPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const books = await client.fetch(
    `*[_type == "bookRecommendation"] | order(_createdAt desc) {
      _id, title, author, year, description, difficulty, bookType, topics, buyLink, reviewSlug
    }`,
    {},
    { next: { tags: ["ressourcen"], revalidate: 60 } }
  );

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <Link
        href={`/${locale}/ressourcen`}
        className="text-xs uppercase tracking-widest mb-8 inline-block transition-colors"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        ← {locale === "de" ? "Ressourcen" : "Resources"}
      </Link>

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
        {locale === "de" ? "Bücher" : "Books"}
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Empfehlenswerte theologische Bücher mit Einordnung nach Thema und Schwierigkeitsgrad."
          : "Recommended theological books categorized by topic and difficulty level."}
      </p>

      <BuecherClient books={books} locale={locale} />
    </div>
  );
}
