import { client } from "@/sanity/client";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

interface ArticleWithImages {
  slug: string;
  title: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  bodyImages: Array<{ url: string; alt?: string; caption?: string }>;
}

interface InfografikEntry {
  slug: string;
  title: string;
  alt?: string;
  imageUrl: string;
}

export async function GET() {
  const [articles, infografiken] = await Promise.all([
    client.fetch<ArticleWithImages[]>(
      `*[_type == "article" && (status == "published" || !defined(status))] {
        "slug": slug.current,
        "title": titleDe,
        "featuredImageUrl": featuredImage.asset->url,
        "featuredImageAlt": featuredImage.alt,
        "bodyImages": bodyDe[_type == "image"] {
          "url": asset->url,
          alt,
          caption
        }
      }`
    ),
    client.fetch<InfografikEntry[]>(
      `*[_type == "infografik"] {
        "slug": coalesce(slug.current, _id),
        title,
        alt,
        "imageUrl": image.asset->url
      }`
    ),
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // Article pages with their images
  for (const article of articles) {
    const images: Array<{ loc: string; title: string }> = [];

    if (article.featuredImageUrl) {
      images.push({
        loc: article.featuredImageUrl,
        title: article.featuredImageAlt || article.title,
      });
    }

    for (const img of article.bodyImages || []) {
      if (img.url) {
        images.push({
          loc: img.url,
          title: img.alt || img.caption || article.title,
        });
      }
    }

    if (images.length > 0) {
      xml += `
  <url>
    <loc>${escapeXml(absoluteUrl(`/de/blog/${article.slug}`))}</loc>`;
      for (const img of images) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
    </image:image>`;
      }
      xml += `
  </url>`;
    }
  }

  // Infographic standalone pages
  for (const info of infografiken) {
    xml += `
  <url>
    <loc>${escapeXml(absoluteUrl(`/de/infografiken/${info.slug}`))}</loc>
    <image:image>
      <image:loc>${escapeXml(info.imageUrl)}</image:loc>
      <image:title>${escapeXml(info.alt || info.title)}</image:title>
    </image:image>
  </url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
