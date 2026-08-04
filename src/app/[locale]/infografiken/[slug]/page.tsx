import { client } from "@/sanity/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl, localePath, getLocaleAlternates, SITE_NAME } from "@/lib/site";
import Script from "next/script";
import Link from "next/link";
import { EmbedCode } from "./EmbedCode";

export const revalidate = 3600;
export const dynamicParams = true;

interface InfografikDetail {
  _id: string;
  title: string;
  description?: string;
  alt?: string;
  publishedAt: string;
  topics: string[];
  articleSlug?: string;
  imageUrl: string;
  slug: string;
}

const infografikBySlugQuery = `*[_type == "infografik" && slug.current == $slug][0]{
  _id, title, description, alt, publishedAt, topics, articleSlug,
  "imageUrl": image.asset->url,
  "slug": slug.current
}`;

const allInfografikSlugsQuery = `*[_type == "infografik" && defined(slug.current)]{ "slug": slug.current }`;

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<Array<{ slug: string }>>(allInfografikSlugsQuery);
    return ["de", "en"].flatMap((locale) =>
      slugs.map(({ slug }) => ({ locale, slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const info = await client.fetch<InfografikDetail | null>(infografikBySlugQuery, { slug });
  if (!info) return { title: "Nicht gefunden", robots: { index: false } };

  const title = info.title;
  const description = info.description || info.alt || title;
  const path = localePath(locale, `/infografiken/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...getLocaleAlternates(`/infografiken/${slug}`),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: locale === "de" ? "de_DE" : "en_US",
      images: [{ url: info.imageUrl + "?w=1200&h=630&fit=crop&auto=format", alt: info.alt || title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [info.imageUrl + "?w=1200&h=630&fit=crop&auto=format"],
    },
  };
}

export default async function InfografikPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isDe = locale === "de";

  const info = await client.fetch<InfografikDetail | null>(infografikBySlugQuery, { slug });
  if (!info) notFound();

  const highResUrl = info.imageUrl + "?w=2400&fit=max&auto=format";
  const displayUrl = info.imageUrl + "?w=1400&fit=max&auto=format";
  const pageUrl = absoluteUrl(`/${locale}/infografiken/${slug}`);

  const imageObjectJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: info.title,
    description: info.description || info.alt || info.title,
    contentUrl: highResUrl,
    url: pageUrl,
    license: "https://creativecommons.org/licenses/by/4.0/",
    acquireLicensePage: absoluteUrl(`/${locale}/infografiken/lizenz`),
    creditText: "Rafael Gutierrez, theologik.org",
    creator: {
      "@type": "Person",
      name: "Rafael Gutierrez",
    },
    copyrightHolder: {
      "@type": "Person",
      name: "Rafael Gutierrez",
    },
    datePublished: info.publishedAt,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isDe ? "Startseite" : "Home",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isDe ? "Infografiken" : "Infographics",
        item: absoluteUrl(`/${locale}/ressourcen/infografiken`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: info.title,
        item: pageUrl,
      },
    ],
  };

  const embedCode = `<a href="${pageUrl}" target="_blank" rel="noopener"><img src="${highResUrl}" alt="${(info.alt || info.title).replace(/"/g, "&quot;")}" style="max-width:100%;height:auto" /></a><p style="font-size:12px;color:#666">Grafik: <a href="https://theologik.org" target="_blank" rel="noopener">Rafael Gutierrez, theologik.org</a> — <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p>`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Script
        id={`schema-imageobject-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectJsonLd) }}
      />
      <Script
        id={`schema-breadcrumb-infografik-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Link
        href={`/${locale}/ressourcen/infografiken`}
        className="text-sm mb-8 inline-block transition-colors hover:text-accent"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        &larr; {isDe ? "Alle Infografiken" : "All Infographics"}
      </Link>

      <h1
        className="text-2xl md:text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {info.title}
      </h1>

      {info.description && (
        <p
          className="text-muted leading-relaxed mb-8 max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {info.description}
        </p>
      )}

      {/* High-res image */}
      <figure className="mb-8">
        <div className="bg-[var(--color-surface)] border border-border rounded-xl p-4 shadow-sm">
          <img
            src={displayUrl}
            alt={info.alt || info.title}
            className="w-full h-auto rounded-lg"
            loading="eager"
          />
        </div>
        <figcaption
          className="mt-3 text-center text-xs text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {info.alt || info.title} — Rafael Gutierrez, theologik.org
        </figcaption>
      </figure>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-12">
        <a
          href={info.imageUrl + "?dl="}
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isDe ? "PNG herunterladen" : "Download PNG"}
        </a>

        {info.articleSlug && (
          <Link
            href={`/${locale}/blog/${info.articleSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}
          >
            {isDe ? "Zum Artikel" : "Read article"} &rarr;
          </Link>
        )}
      </div>

      {/* Embed code */}
      <section className="mb-12">
        <h2
          className="text-lg font-semibold mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {isDe ? "Einbetten" : "Embed"}
        </h2>
        <p
          className="text-sm text-muted mb-3"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {isDe
            ? "Kopiere diesen Code, um die Grafik auf deiner Website einzubinden. Die Quellenangabe ist automatisch enthalten."
            : "Copy this code to embed the graphic on your website. Attribution is automatically included."}
        </p>
        <EmbedCode code={embedCode} locale={locale} />
      </section>

      {/* License note */}
      <section
        className="border-t border-border pt-6 text-sm text-muted"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <p>
          {isDe ? "Lizenz: " : "License: "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            CC BY 4.0
          </a>
          {" — "}
          <Link href={`/${locale}/infografiken/lizenz`} className="text-accent hover:underline">
            {isDe ? "Details zur Lizenz" : "License details"}
          </Link>
        </p>
      </section>
    </div>
  );
}
