import { groq } from "next-sanity";
import { client } from "@/sanity/client";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

interface FeedArticle {
  _type: string;
  titleDe?: string;
  questionDe?: string;
  slug: { current: string };
  excerptDe?: string;
  shortAnswerDe?: string;
  publishedAt: string;
}

const feedArticlesQuery = groq`
  *[_type == "article" && status == "published"] | order(publishedAt desc) [0...20] {
    _type,
    titleDe,
    slug,
    excerptDe,
    publishedAt
  }
`;

const feedKurzGefragtQuery = groq`
  *[_type == "kurzGefragt" && (status == "published" || !defined(status))] | order(publishedAt desc) [0...10] {
    _type,
    questionDe,
    slug,
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
  const feedUrl = absoluteUrl("/feed.xml");

  const items = allItems
    .map((item) => {
      const isKG = item._type === "kurzGefragt";
      const link = `${siteUrl}/de/${isKG ? "kurz-gefragt" : "blog"}/${item.slug.current}`;
      const pubDate = new Date(item.publishedAt).toUTCString();
      const title = escapeXml(isKG ? (item.questionDe ?? "") : (item.titleDe ?? ""));
      const description = isKG
        ? (item.shortAnswerDe ? escapeXml(item.shortAnswerDe) : "")
        : (item.excerptDe ? escapeXml(item.excerptDe) : "");

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
    <link>${siteUrl}</link>
    <description>Fundierte Artikel zu Theologie, Bibelauslegung und Kirchengeschichte – Κατὰ τὰς Γραφάς.</description>
    <language>de</language>
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
