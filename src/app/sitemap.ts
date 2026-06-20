import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { allArticleSlugsQuery, allCategoriesQuery, allProjectSlugsQuery } from "@/sanity/queries";
import { absoluteUrl, SUPPORTED_LOCALES } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/blog",
    "/projekte",
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
  let projectEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, categories, projects] = await Promise.all([
      client.fetch(allArticleSlugsQuery),
      client.fetch(allCategoriesQuery),
      client.fetch(allProjectSlugsQuery),
    ]);

    articleEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (articles as Array<{ slug: string; publishedAt?: string; _updatedAt?: string }>).map(({ slug, publishedAt, _updatedAt }): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/blog/${slug}`),
        lastModified: _updatedAt ? new Date(_updatedAt) : publishedAt ? new Date(publishedAt) : new Date(),
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
    projectEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (projects as Array<{ slug: string }>).map(({ slug }): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/projekte/${slug}`),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      }))
    );
  } catch {
    return staticEntries;
  }

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...projectEntries];
}
