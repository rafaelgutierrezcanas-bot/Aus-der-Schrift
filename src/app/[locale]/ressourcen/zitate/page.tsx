import Link from "next/link";
import { client } from "@/sanity/client";
import { ZitateClient } from "@/components/ZitateClient";
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
    pathname: "/ressourcen/zitate",
    deTitle: "Theologische Zitate",
    enTitle: "Theological Quotes",
    deDescription:
      "Theologische Zitate bedeutender Autoren und Denker, nach Thema geordnet – von Luther bis Spurgeon.",
    enDescription:
      "Theological quotes from significant authors and thinkers, organized by topic – from Luther to Spurgeon.",
    keywords: [
      "theologische Zitate",
      "christliche Zitate",
      "Luther Zitate",
      "Spurgeon Zitate",
      "Kirchenväter Zitate",
      "Reformatoren Zitate",
    ],
  });
}

export default async function ZitatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const quotes = await client.fetch(
    `*[_type == "quote"] | order(_createdAt desc) {
      _id, text, author, topics, customSource,
      "source": source->{ title, author, year }
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
        {locale === "de" ? "Zitate" : "Quotes"}
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Theologische Zitate bedeutender Autoren und Denker, nach Thema geordnet."
          : "Theological quotes from significant authors and thinkers, organized by topic."}
      </p>

      <ZitateClient quotes={quotes} locale={locale} />
    </div>
  );
}
