import { groq } from "next-sanity";

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
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
  *[_type == "article" && slug.current == $slug][0] {
    _id,
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
    "sources": sources[]->{ _id, title, authors, year, type, publisher, pages }
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) {
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
  *[_type == "article" && category->slug.current == $categorySlug && slug.current != $currentSlug] | order(publishedAt desc)[0..2] {
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
  *[_type == "article"] { "slug": slug.current }
`;

export const recommendedArticlesQuery = groq`
  *[_type == "article" && isRecommended == true] | order(publishedAt desc) {
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
  *[_type == "article"] | order(publishedAt desc) [0..5] {
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
