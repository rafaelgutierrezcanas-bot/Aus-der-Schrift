import { groq } from "next-sanity";

export const allArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && (status == "published" || !defined(status))][0] {
    _id,
    _updatedAt,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    bodyDe,
    bodyEn,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name, bio, image },
    "sources": sources[]->{ _id, title, authors, year, type, publisher, volume, issue, city, edition, doi, pages, url },
    isPaper,
    abstractDe,
    abstractEn,
    keywords
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;

export const relatedArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && category->slug.current == $categorySlug && slug.current != $currentSlug] | order(publishedAt desc)[0..2] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug }
  }
`;

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(titleDe asc) {
    _id,
    titleDe,
    titleEn,
    slug,
    descriptionDe,
    descriptionEn
  }
`;

export const allArticleSlugsQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] { "slug": slug.current, publishedAt, _updatedAt }
`;

export const recommendedArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && isRecommended == true] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;

export const latestArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) [0..5] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;
