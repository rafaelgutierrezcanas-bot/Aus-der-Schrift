import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { allArticleSlugsQuery, allCategoriesQuery } from "@/sanity/queries";
import { absoluteUrl, SUPPORTED_LOCALES } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/blog",
    "/uber-uns",
    "/zu-meiner-person",
    "/ressourcen",
    "/kontakt",
    "/impressum",
  ];

  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    staticPaths.map((path): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.7,
    }))
  );

  let articleEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, categories] = await Promise.all([
      client.fetch(allArticleSlugsQuery),
      client.fetch(allCategoriesQuery),
    ]);

    articleEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (articles as Array<{ slug: string }>).map(({ slug }): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/blog/${slug}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }))
    );

    categoryEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (
        categories as Array<{
          slug: { current: string };
        }>
      ).map((category): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/kategorien/${category.slug.current}`),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
      }))
    );
  } catch {
    return staticEntries;
  }

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
