import Link from "next/link";
import { client } from "@/sanity/client";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { InfografikanClient } from "@/components/InfografikanClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen/infografiken",
    deTitle: "Theologische Infografiken",
    enTitle: "Theological Infographics",
    deDescription:
      "Theologische Infografiken zu Bibelauslegung, Kirchengeschichte und systematischer Theologie — frei verwendbar mit Quellenangabe.",
    enDescription:
      "Theological infographics on biblical interpretation, church history, and systematic theology — free to use with attribution.",
  });
}

interface Infografik {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  articleSlug?: string;
  imageUrl: string;
}

export default async function InfografikanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const infografiken: Infografik[] = await client.fetch(
    `*[_type == "infografik"] | order(publishedAt desc) {
      _id, title, description, publishedAt, topics, articleSlug,
      "imageUrl": image.asset->url
    }`,
    {},
    { next: { tags: ["ressourcen"], revalidate: 60 } }
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href={`/${locale}/ressourcen`}
        className="text-sm mb-8 inline-block transition-colors hover:text-accent"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        &larr; {locale === "de" ? "Zurück" : "Back"}
      </Link>

      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Infografiken" : "Infographics"}
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {locale === "de" ? "Infografiken" : "Infographics"}
      </h1>
      <p
        className="text-muted mb-4 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Theologische Infografiken zu verschiedenen Themen — übersichtlich aufbereitet und visuell gestaltet."
          : "Theological infographics on various topics — clearly presented and visually designed."}
      </p>
      <p
        className="text-sm mb-12 leading-relaxed border-l-2 border-accent pl-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Alle Infografiken dürfen gerne geteilt und weiterverwendet werden — mit Quellenangabe (Rafael Gutierrez, theologik.org)."
          : "All infographics may be freely shared and reused — with attribution (Rafael Gutierrez, theologik.org)."}
      </p>

      <InfografikanClient infografiken={infografiken} locale={locale} />
    </div>
  );
}
