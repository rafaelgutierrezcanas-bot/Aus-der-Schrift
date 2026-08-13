import { groq } from "next-sanity";
import { client } from "@/sanity/client";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

interface FeedArticle {
  _type: string;
  titleEn?: string;
  titleDe?: string;
  questionEn?: string;
  questionDe?: string;
  slug: { current: string };
  slugEn?: { current: string };
  excerptEn?: string;
  excerptDe?: string;
  shortAnswerEn?: string;
  shortAnswerDe?: string;
  publishedAt: string;
}

const feedArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) [0...20] {
    _type,
    titleEn,
    titleDe,
    slug,
    slugEn,
    excerptEn,
    excerptDe,
    publishedAt
  }
`;

const feedKurzGefragtQuery = groq`
  *[_type == "kurzGefragt" && (status == "published" || !defined(status))] | order(publishedAt desc) [0...10] {
    _type,
    questionEn,
    questionDe,
    slug,
    slugEn,
    shortAnswerEn,
    shortAnswerDe,
    publishedAt
  }
`;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [articles, kurzGefragt] = await Promise.all([
    client.fetch<FeedArticle[]>(feedArticlesQuery),
    client.fetch<FeedArticle[]>(feedKurzGefragtQuery),
  ]);

  const allItems = [...articles, ...kurzGefragt].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const siteUrl = absoluteUrl();
  const feedUrl = absoluteUrl("/feed-en.xml");

  const items = allItems
    .map((item) => {
      const isKG = item._type === "kurzGefragt";
      const enSlug = item.slugEn?.current || item.slug.current;
      const link = `${siteUrl}/en/${isKG ? "kurz-gefragt" : "blog"}/${enSlug}`;
      const pubDate = new Date(item.publishedAt).toUTCString();
      const title = escapeXml(
        isKG
          ? (item.questionEn || item.questionDe || "")
          : (item.titleEn || item.titleDe || "")
      );
      const description = isKG
        ? (item.shortAnswerEn || item.shortAnswerDe ? escapeXml(item.shortAnswerEn || item.shortAnswerDe || "") : "")
        : (item.excerptEn || item.excerptDe ? escapeXml(item.excerptEn || item.excerptDe || "") : "");

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${siteUrl}/en</link>
    <description>Well-researched articles on theology, biblical interpretation, and church history – Κατὰ τὰς Γραφάς.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
