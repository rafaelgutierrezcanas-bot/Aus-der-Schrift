import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { allArticleSlugsQuery, allCategoriesQuery, allProjectSlugsQuery } from "@/sanity/queries";
import { absoluteUrl, SUPPORTED_LOCALES } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/blog",
    "/projekte",
    "/zu-meiner-person",
    "/ressourcen",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/infografiken/lizenz",
  ];

  // Use a fixed date for truly static pages — updated only on content changes
  const staticLastMod = new Date("2025-06-01");

  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    staticPaths.map((path): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: staticLastMod,
      changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LOCALES.map((l) => [l, absoluteUrl(`/${l}${path}`)])
        ),
      },
    }))
  );

  let articleEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  let projectEntries: MetadataRoute.Sitemap = [];
  let infografikEntries: MetadataRoute.Sitemap = [];

  try {
    const [articles, categories, projects, infografiken] = await Promise.all([
      client.fetch(allArticleSlugsQuery),
      client.fetch<Array<{ slug: { current: string }; _updatedAt?: string }>>(`*[_type == "category"]{ slug, _updatedAt }`),
      client.fetch<Array<{ slug: string; _updatedAt?: string }>>(`*[_type == "project" && isPublic != false]{ "slug": slug.current, _updatedAt }`),
      client.fetch<Array<{ slug: string; publishedAt?: string }>>(`*[_type == "infografik" && defined(slug.current)]{ "slug": slug.current, publishedAt }`),
    ]);

    articleEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (articles as Array<{ slug: string; slugEn?: string; publishedAt?: string; _updatedAt?: string }>).map(({ slug, slugEn, publishedAt, _updatedAt }): MetadataRoute.Sitemap[number] => {
        const deSlug = slug;
        const enSlug = slugEn || slug;
        return {
          url: absoluteUrl(`/${locale}/blog/${locale === "en" ? enSlug : deSlug}`),
          lastModified: _updatedAt ? new Date(_updatedAt) : publishedAt ? new Date(publishedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              de: absoluteUrl(`/de/blog/${deSlug}`),
              en: absoluteUrl(`/en/blog/${enSlug}`),
            },
          },
        };
      })
    );

    categoryEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (
        categories as Array<{
          slug: { current: string };
          _updatedAt?: string;
        }>
      ).map((category): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/kategorien/${category.slug.current}`),
        lastModified: category._updatedAt ? new Date(category._updatedAt) : staticLastMod,
        changeFrequency: "weekly",
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((l) => [l, absoluteUrl(`/${l}/kategorien/${category.slug.current}`)])
          ),
        },
      }))
    );
    projectEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      (projects as Array<{ slug: string; _updatedAt?: string }>).map(({ slug, _updatedAt }): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/projekte/${slug}`),
        lastModified: _updatedAt ? new Date(_updatedAt) : staticLastMod,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((l) => [l, absoluteUrl(`/${l}/projekte/${slug}`)])
          ),
        },
      }))
    );
    infografikEntries = SUPPORTED_LOCALES.flatMap((locale) =>
      infografiken.map(({ slug, publishedAt }): MetadataRoute.Sitemap[number] => ({
        url: absoluteUrl(`/${locale}/infografiken/${slug}`),
        lastModified: publishedAt ? new Date(publishedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: {
          languages: Object.fromEntries(
            SUPPORTED_LOCALES.map((l) => [l, absoluteUrl(`/${l}/infografiken/${slug}`)])
          ),
        },
      }))
    );
  } catch {
    return staticEntries;
  }

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...projectEntries, ...infografikEntries];
}
