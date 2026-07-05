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
    difficulty,
    tags,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
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
    keywords,
    tags,
    difficulty
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
    difficulty,
    tags,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
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
    difficulty,
    tags,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
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
    difficulty,
    tags,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
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
    difficulty,
    tags,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    titleEn,
    slug,
    status,
    startedAt,
    description,
    descriptionEn,
    researchQuestionDe,
    researchQuestionEn,
    plannedOutput,
    "articles": *[_type == "article" && references(^._id) && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      excerptDe,
      excerptEn,
      language,
      difficulty,
      "featuredImage": featuredImage { ..., "asset": asset-> },
      "category": category->{ titleDe, titleEn, slug },
      "author": author->{ name }
    }
  }
`;

export const allProjectSlugsQuery = groq`
  *[_type == "project" && isPublic != false] { "slug": slug.current }
`;

export const allProjectsQuery = groq`
  *[_type == "project" && isPublic != false] | order(startedAt desc) {
    _id,
    title,
    titleEn,
    slug,
    status,
    startedAt,
    description,
    descriptionEn,
    researchQuestionDe,
    researchQuestionEn,
    plannedOutput,
    "articleCount": count(*[_type == "article" && references(^._id) && (status == "published" || !defined(status))])
  }
`;

// ── Hermeneutik ──────────────────────────────────────────

export const allHermeneutikStepsQuery = groq`
  *[_type == "hermeneutikSchritt"] | order(order asc) {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    order,
    accentColor,
    icon,
    explanationDe,
    explanationEn,
    guidingQuestionsDe,
    guidingQuestionsEn,
    commonMistakesDe,
    commonMistakesEn,
    interactionType,
    sources
  }
`;

export const allHermeneutikTextsQuery = groq`
  *[_type == "hermeneutikText"] | order(order asc) {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    bibleReference,
    genre,
    difficulty,
    order
  }
`;

export const hermeneutikTextBySlugQuery = groq`
  *[_type == "hermeneutikText" && slug.current == $slug][0] {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    bibleReference,
    genre,
    difficulty,
    textContentDe,
    textContentEn,
    backgroundInfoDe,
    backgroundInfoEn,
    stepAnalyses[] {
      step-> {
        _id,
        titleDe,
        titleEn,
        "slug": slug.current,
        order,
        accentColor,
        icon,
        interactionType,
        guidingQuestionsDe,
        guidingQuestionsEn
      },
      expertAnalysisDe,
      expertAnalysisEn,
      hintsDe,
      hintsEn,
      interactionData
    }
  }
`;
