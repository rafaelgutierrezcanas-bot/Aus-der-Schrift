import { groq } from "next-sanity";
import { client } from "@/sanity/client";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

interface FeedArticle {
  titleEn: string;
  titleDe: string;
  slug: { current: string };
  slugEn?: { current: string };
  excerptEn?: string;
  excerptDe?: string;
  publishedAt: string;
}

const feedArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) [0...20] {
    titleEn,
    titleDe,
    slug,
    slugEn,
    excerptEn,
    excerptDe,
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
  const articles = await client.fetch<FeedArticle[]>(feedArticlesQuery);

  const siteUrl = absoluteUrl();
  const feedUrl = absoluteUrl("/feed-en.xml");

  const items = articles
    .map((article) => {
      const enSlug = article.slugEn?.current || article.slug.current;
      const link = `${siteUrl}/en/blog/${enSlug}`;
      const pubDate = new Date(article.publishedAt).toUTCString();
      const title = escapeXml(article.titleEn || article.titleDe || "");
      const description = article.excerptEn || article.excerptDe
        ? escapeXml(article.excerptEn || article.excerptDe || "")
        : "";

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
