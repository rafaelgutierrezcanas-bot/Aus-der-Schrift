import { groq } from "next-sanity";

export const allArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    slugEn,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    difficulty,
    tags,
    bibleReferences,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    "project": project->{ _id, title, titleEn, slug },
    seriesOrder,
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && (slug.current == $slug || slugEn.current == $slug) && (status == "published" || !defined(status))][0] {
    _id,
    _updatedAt,
    titleDe,
    titleEn,
    seoTitleDe,
    seoTitleEn,
    slug,
    slugEn,
    publishedAt,
    bodyDe[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    },
    bodyEn[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    },
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
    bibleReferences,
    difficulty,
    seriesOrder,
    "project": project->{ _id, title, titleEn, slug }
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    slugEn,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    difficulty,
    tags,
    bibleReferences,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    "project": project->{ _id, title, titleEn, slug },
    seriesOrder,
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
    slugEn,
    publishedAt,
    excerptDe,
    excerptEn,
    difficulty,
    tags,
    bibleReferences,
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
  *[_type == "article" && (status == "published" || !defined(status))] { "slug": slug.current, "slugEn": slugEn.current, publishedAt, _updatedAt }
`;

export const recommendedArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && isRecommended == true] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    slugEn,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    difficulty,
    tags,
    bibleReferences,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    "project": project->{ _id, title, titleEn, slug },
    seriesOrder,
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
    slugEn,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    difficulty,
    tags,
    bibleReferences,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name },
    "project": project->{ _id, title, titleEn, slug },
    seriesOrder,
    bodyDe[] { _type, children[] { text } },
    bodyEn[] { _type, children[] { text } }
  }
`;

export const allProjectsQuery = groq`
  *[_type == "project"] | order(title asc) {
    _id,
    title,
    titleEn,
    slug,
    description,
    descriptionEn,
    "articleCount": count(*[_type == "article" && references(^._id) && (status == "published" || !defined(status))])
  }
`;

export const seriesArticlesQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && project._ref == $projectId] | order(seriesOrder asc, publishedAt asc) {
    _id,
    titleDe,
    titleEn,
    slug,
    slugEn,
    seriesOrder
  }
`;

export const backlinksQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && slug.current != $slug &&
    (
      count(bodyDe[_type == "block"][count(markDefs[_type == "internalLink" && (slug == $slug || reference->slug.current == $slug)]) > 0]) > 0 ||
      count(bodyEn[_type == "block"][count(markDefs[_type == "internalLink" && (slug == $slug || reference->slug.current == $slug)]) > 0]) > 0
    )
  ] | order(publishedAt desc) [0..9] {
    _id, titleDe, titleEn, slug, slugEn, publishedAt
  }
`;

// ── Kurz gefragt ────────────────────────────────────────

export const allKurzGefragtQuery = groq`
  *[_type == "kurzGefragt" && (status == "published" || !defined(status))]
    | order(publishedAt desc) {
    _id, questionDe, questionEn, slug, slugEn, verdict, shortAnswerDe, shortAnswerEn,
    publishedAt, category->{ titleDe, titleEn, slug }
  }
`;

export const kurzGefragtBySlugQuery = groq`
  *[_type == "kurzGefragt"
    && (slug.current == $slug || slugEn.current == $slug)
    && (status == "published" || !defined(status))][0] {
    ...,
    bodyDe[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    },
    bodyEn[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    },
    category->{ titleDe, titleEn, slug },
    relatedArticles[]->{ _id, titleDe, titleEn, slug, slugEn, publishedAt, category->{ titleDe, titleEn, slug }, excerptDe, excerptEn, featuredImage, difficulty },
    relatedQuestions[]->{ _id, questionDe, questionEn, slug, slugEn, verdict, category->{ titleDe, titleEn } }
  }
`;

export const allKurzGefragtSlugsQuery = groq`
  *[_type == "kurzGefragt" && (status == "published" || !defined(status))] {
    "slug": slug.current, "slugEn": slugEn.current, publishedAt, _updatedAt
  }
`;

// ── Pages ──────────────────────────────────────────────

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id, titleDe, titleEn,
    bodyDe[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    },
    bodyEn[] {
      ...,
      markDefs[] {
        ...,
        _type == "internalLink" => {
          ...,
          "slug": reference->slug.current,
          "docType": reference->_type
        }
      }
    }
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
