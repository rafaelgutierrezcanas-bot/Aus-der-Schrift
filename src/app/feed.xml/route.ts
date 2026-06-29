import { groq } from "next-sanity";
import { client } from "@/sanity/client";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const revalidate = 3600;

interface FeedArticle {
  titleDe: string;
  slug: { current: string };
  excerptDe?: string;
  publishedAt: string;
}

const feedArticlesQuery = groq`
  *[_type == "article" && status == "published"] | order(publishedAt desc) [0...20] {
    titleDe,
    slug,
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
  const feedUrl = absoluteUrl("/feed.xml");

  const items = articles
    .map((article) => {
      const link = `${siteUrl}/de/blog/${article.slug.current}`;
      const pubDate = new Date(article.publishedAt).toUTCString();
      const title = escapeXml(article.titleDe ?? "");
      const description = article.excerptDe
        ? escapeXml(article.excerptDe)
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
    <title>${escapeXml(SITE_NAME)} – Aus der Schrift</title>
    <link>${siteUrl}</link>
    <description>Theologische Artikel und Bibelstudien – exegetisch, reformiert, klar.</description>
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
