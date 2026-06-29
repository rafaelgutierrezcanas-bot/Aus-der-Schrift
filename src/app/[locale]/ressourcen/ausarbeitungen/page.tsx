import Link from "next/link";
import { client } from "@/sanity/client";
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

      {ausarbeitungen.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
          {locale === "de"
            ? "Noch keine Ausarbeitungen vorhanden."
            : "No papers available yet."}
        </p>
      ) : (
        <div>
          {ausarbeitungen.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border p-6 mb-4"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <h2
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
              >
                {item.title}
              </h2>

              {item.description && (
                <p
                  className="text-sm mb-3"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
                >
                  {item.description}
                </p>
              )}

              <p
                className="text-xs mb-3"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
              >
                {new Date(item.publishedAt).toLocaleDateString(
                  locale === "de" ? "de-DE" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>

              {item.topics && item.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs border border-border rounded-full px-2 py-0.5"
                      style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1 text-sm hover:underline"
                  style={{ color: "var(--color-accent)", fontFamily: "var(--font-sans)" }}
                >
                  {locale === "de" ? "PDF herunterladen" : "Download PDF"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
