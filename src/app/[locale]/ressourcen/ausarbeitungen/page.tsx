import Link from "next/link";
import { client } from "@/sanity/client";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { AusarbeitungenClient } from "@/components/AusarbeitungenClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen/ausarbeitungen",
    deTitle: "Theologische Ausarbeitungen",
    enTitle: "Theological Papers",
    deDescription:
      "Eigene theologische Ausarbeitungen und Studien zu Bibelauslegung, Kirchengeschichte und systematischer Theologie.",
    enDescription:
      "Original theological papers and studies on biblical interpretation, church history, and systematic theology.",
    keywords: [
      "theologische Ausarbeitung",
      "Theologie Studium",
      "Bibelauslegung Studie",
      "systematische Theologie",
      "Hermeneutik",
    ],
  });
}

interface Ausarbeitung {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  fileUrl: string;
}

export default async function AusarbeitungenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const ausarbeitungen: Ausarbeitung[] = await client.fetch(
    `*[_type == "ausarbeitung"] | order(publishedAt desc) {
      _id, title, description, publishedAt, topics,
      "fileUrl": file.asset->url
    }`,
    {},
    { next: { tags: ["ressourcen"], revalidate: 60 } }
  );

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <Link
        href={`/${locale}/ressourcen`}
        className="text-sm mb-8 inline-block transition-colors hover:text-accent"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        ← {locale === "de" ? "Zurück" : "Back"}
      </Link>

      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Ausarbeitungen
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Ausarbeitungen
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Eigene theologische Ausarbeitungen zum Herunterladen."
          : "My own theological papers for download."}
      </p>

      <AusarbeitungenClient ausarbeitungen={ausarbeitungen} locale={locale} />
    </div>
  );
}
