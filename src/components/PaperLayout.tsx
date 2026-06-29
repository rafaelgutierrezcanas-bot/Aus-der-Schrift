import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { formatChicago, type Source } from "@/lib/formatChicago";
import { formatDate } from "@/lib/utils";

interface FootnoteNode {
  _type: "footnote";
  _key: string;
  sourceId?: string | null;
  text?: string;
  pages?: string;
  _fnIndex?: number;
}

interface PaperLayoutProps {
  article: Record<string, unknown>;
  locale: string;
  body: unknown[];
  footnotes: FootnoteNode[];
  sourcesMap: Map<string, Source>;
}

export function PaperLayout({ article, locale, body, footnotes, sourcesMap }: PaperLayoutProps) {
  const title =
    locale === "en" && article.titleEn
      ? (article.titleEn as string)
      : (article.titleDe as string);

  const abstract =
    locale === "en" && article.abstractEn
      ? (article.abstractEn as string)
      : (article.abstractDe as string | undefined);

  const keywords = article.keywords as string[] | undefined;
  const author = (article.author as Record<string, unknown> | null)?.name as string | undefined;
  const category = (article.category as Record<string, unknown> | null);
  const categoryTitle =
    locale === "en"
      ? (category?.titleEn as string | undefined) || (category?.titleDe as string | undefined)
      : (category?.titleDe as string | undefined);

  const publishedAt = article.publishedAt as string | undefined;

  // Alphabetically sorted sources for bibliography
  const allSources = Array.from(sourcesMap.values()).sort((a, b) => {
    const nameA = (a.authors || "").toLowerCase();
    const nameB = (b.authors || "").toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

  const currentYear = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();

  return (
    <div
      className="max-w-2xl mx-auto px-8 py-12"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {/* Journal Header */}
      <div className="flex justify-between items-baseline mb-8 pb-3 border-b-2 border-foreground">
        <span
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Theologik
        </span>
        <span
          className="text-xs text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {currentYear}
        </span>
      </div>

      {/* Title block */}
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
          {title}
        </h1>
        <div
          className="text-sm text-muted space-x-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {author && <span>{author}</span>}
          {categoryTitle && (
            <>
              <span>·</span>
              <span>{categoryTitle}</span>
            </>
          )}
          {publishedAt && (
            <>
              <span>·</span>
              <span>{formatDate(publishedAt, locale)}</span>
            </>
          )}
        </div>
      </header>

      {/* Abstract */}
      {abstract && (
        <div className="mb-6 p-4 border border-border bg-surface/50">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Zusammenfassung" : "Abstract"}
          </p>
          <p className="text-sm leading-relaxed">{abstract}</p>
        </div>
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <p
          className="text-xs text-muted mb-6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="font-semibold">
            {locale === "de" ? "Schlüsselwörter:" : "Keywords:"}
          </span>{" "}
          {keywords.join(", ")}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-border mb-8" />

      {/* Body */}
      {body && body.length > 0 && (
        <div className="prose-paper">
          <PortableTextRenderer value={body} locale={locale} />
        </div>
      )}

      {/* Footnotes */}
      {footnotes.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Fußnoten" : "Footnotes"}
          </p>
          <ol className="space-y-2">
            {footnotes.map((fn) => {
              const src = fn.sourceId ? sourcesMap.get(fn.sourceId) : null;
              const citation = src ? formatChicago(src, fn.pages) : (fn.text || "—");
              return (
                <li
                  key={fn._key}
                  id={`fn-${fn._fnIndex}`}
                  className="flex gap-3 text-xs text-muted leading-relaxed"
                >
                  <span
                    className="shrink-0 text-accent font-medium"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <a href={`#fnref-${fn._fnIndex}`} aria-label={locale === "de" ? "Zurück zum Text" : "Back to text"}>
                      [{fn._fnIndex}]
                    </a>
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)" }}>{citation}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Bibliography */}
      {allSources.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Literaturverzeichnis" : "Bibliography"}
          </p>
          <ul className="space-y-2">
            {allSources.map((source) => (
              <li
                key={source._id}
                className="text-xs text-muted leading-relaxed"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {formatChicago(source)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer line */}
      <div className="mt-12 pt-4 border-t border-border flex justify-between items-center">
        <span
          className="text-[10px] text-muted tracking-widest uppercase"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Theologik · theologik.org
        </span>
        <span
          className="text-[10px] text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          © {currentYear}
        </span>
      </div>
    </div>
  );
}
