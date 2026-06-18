import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { articleBySlugQuery } from "@/sanity/queries";
import { formatChicago, type Source } from "@/lib/formatChicago";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// Register a serif font for PDF rendering
Font.registerHyphenationCallback((word) => [word]);

interface FootnoteNode {
  _type: "footnote";
  _key: string;
  sourceId?: string | null;
  text?: string;
  pages?: string;
  _fnIndex?: number;
}

function annotateFootnotes(body: unknown[]): { annotated: unknown[]; footnotes: FootnoteNode[] } {
  let count = 0;
  const footnotes: FootnoteNode[] = [];
  const annotated = (body as Record<string, unknown>[]).map((block) => {
    if (block._type === "block" && Array.isArray(block.children)) {
      const children = (block.children as Record<string, unknown>[]).map((child) => {
        if (child._type === "footnote") {
          count++;
          const fn = { ...child, _fnIndex: count } as unknown as FootnoteNode;
          footnotes.push(fn);
          return fn;
        }
        return child;
      });
      return { ...block, children };
    }
    return block;
  });
  return { annotated, footnotes };
}

/** Extract plain text from PortableText blocks */
function extractPlainText(body: unknown[]): string {
  return (body as Record<string, unknown>[])
    .filter((b) => b._type === "block" && Array.isArray(b.children))
    .map((b) => {
      const children = (b.children as Record<string, unknown>[])
        .filter((c) => c._type === "span" || c._type === "footnote")
        .map((c) => {
          if (c._type === "footnote") {
            return `[${(c as unknown as FootnoteNode)._fnIndex ?? ""}]`;
          }
          return (c.text as string) ?? "";
        })
        .join("");
      return children;
    })
    .filter(Boolean)
    .join("\n\n");
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    paddingTop: 56,
    paddingBottom: 56,
    paddingLeft: 64,
    paddingRight: 64,
    color: "#1a1a1a",
    lineHeight: 1.6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#1a1a1a",
  },
  headerLabel: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerYear: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#666",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 1.3,
  },
  metaRow: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    marginVertical: 14,
  },
  abstractBox: {
    borderWidth: 0.5,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  abstractLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 4,
  },
  abstractText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  keywordsRow: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#555",
    marginBottom: 14,
  },
  bodyParagraph: {
    marginBottom: 10,
    textAlign: "justify",
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 8,
    marginTop: 4,
  },
  footnoteRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  footnoteIndex: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#555",
    width: 20,
    flexShrink: 0,
  },
  footnoteText: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#555",
    flex: 1,
    lineHeight: 1.4,
  },
  bibEntry: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#333",
    marginBottom: 6,
    lineHeight: 1.4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  footerText: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

function buildPdfDocument(data: {
  title: string;
  author?: string;
  categoryTitle?: string;
  publishedAt?: string;
  abstract?: string;
  keywords?: string[];
  bodyText: string;
  footnotes: FootnoteNode[];
  sourcesMap: Map<string, Source>;
  year: number;
  locale: string;
}) {
  const {
    title, author, categoryTitle, publishedAt, abstract, keywords,
    bodyText, footnotes, sourcesMap, year, locale,
  } = data;

  const metaParts = [author, categoryTitle, publishedAt ? new Date(publishedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US") : undefined].filter(Boolean);

  const allSources = Array.from(sourcesMap.values()).sort((a, b) =>
    (a.authors || "").toLowerCase().localeCompare((b.authors || "").toLowerCase())
  );

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.headerRow },
        React.createElement(Text, { style: styles.headerLabel }, "Theologik"),
        React.createElement(Text, { style: styles.headerYear }, String(year))
      ),

      // Title
      React.createElement(Text, { style: styles.title }, title),

      // Meta
      metaParts.length > 0 &&
        React.createElement(Text, { style: styles.metaRow }, metaParts.join(" · ")),

      // Abstract
      abstract &&
        React.createElement(
          View,
          { style: styles.abstractBox },
          React.createElement(
            Text,
            { style: styles.abstractLabel },
            locale === "de" ? "Zusammenfassung" : "Abstract"
          ),
          React.createElement(Text, { style: styles.abstractText }, abstract)
        ),

      // Keywords
      keywords && keywords.length > 0 &&
        React.createElement(
          Text,
          { style: styles.keywordsRow },
          `${locale === "de" ? "Schlüsselwörter" : "Keywords"}: ${keywords.join(", ")}`
        ),

      // Divider
      React.createElement(View, { style: styles.divider }),

      // Body paragraphs
      ...bodyText.split("\n\n").filter(Boolean).map((para, i) =>
        React.createElement(Text, { key: `para-${i}`, style: styles.bodyParagraph }, para)
      ),

      // Footnotes
      footnotes.length > 0 &&
        React.createElement(
          View,
          { style: { marginTop: 16, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#ccc" } },
          React.createElement(
            Text,
            { style: styles.sectionLabel },
            locale === "de" ? "Fußnoten" : "Footnotes"
          ),
          ...footnotes.map((fn) => {
            const src = fn.sourceId ? sourcesMap.get(fn.sourceId) : null;
            const citation = src ? formatChicago(src, fn.pages) : (fn.text || "—");
            return React.createElement(
              View,
              { key: fn._key, style: styles.footnoteRow },
              React.createElement(Text, { style: styles.footnoteIndex }, `[${fn._fnIndex}]`),
              React.createElement(Text, { style: styles.footnoteText }, citation)
            );
          })
        ),

      // Bibliography
      allSources.length > 0 &&
        React.createElement(
          View,
          { style: { marginTop: 16, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#ccc" } },
          React.createElement(
            Text,
            { style: styles.sectionLabel },
            locale === "de" ? "Literaturverzeichnis" : "Bibliography"
          ),
          ...allSources.map((src) =>
            React.createElement(Text, { key: src._id, style: styles.bibEntry }, formatChicago(src))
          )
        ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, "Theologik · theologik.org"),
        React.createElement(Text, { style: styles.footerText }, `© ${year}`)
      )
    )
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "de";

  const article = await client.fetch(
    articleBySlugQuery,
    { slug },
    { next: { revalidate: 0 } }
  );

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rawBody =
    locale === "en" && article.bodyEn ? article.bodyEn : article.bodyDe;

  const { annotated: annotatedBody, footnotes } = annotateFootnotes(rawBody ?? []);
  const bodyText = extractPlainText(annotatedBody);

  const sourcesMap = new Map<string, Source>(
    ((article.sources ?? []) as Source[]).map((s: Source) => [s._id, s])
  );

  const title =
    locale === "en" && article.titleEn ? article.titleEn : article.titleDe;
  const author = (article.author as Record<string, unknown> | null)?.name as string | undefined;
  const category = (article.category as Record<string, unknown> | null);
  const categoryTitle =
    locale === "en"
      ? (category?.titleEn as string | undefined) || (category?.titleDe as string | undefined)
      : (category?.titleDe as string | undefined);

  const abstract =
    locale === "en" && article.abstractEn
      ? (article.abstractEn as string)
      : (article.abstractDe as string | undefined);

  const keywords = article.keywords as string[] | undefined;
  const publishedAt = article.publishedAt as string | undefined;
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();

  const doc = buildPdfDocument({
    title,
    author,
    categoryTitle,
    publishedAt,
    abstract,
    keywords,
    bodyText,
    footnotes,
    sourcesMap,
    year,
    locale,
  });

  const buffer = await renderToBuffer(doc);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  });
}
