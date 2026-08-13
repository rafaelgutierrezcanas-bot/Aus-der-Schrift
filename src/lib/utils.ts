export function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
}

export function estimateReadingTime(body: unknown[]): number {
  if (!body || body.length === 0) return 1;
  const text = (body as Array<{ _type: string; children?: Array<{ text: string }> }>)
    .filter((b) => b._type === "block")
    .map((b) => b.children?.map((c) => c.text).join("") || "")
    .join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getLocalizedTitle(article: Record<string, unknown>, locale: string): string {
  if (locale === "en" && article.titleEn) return article.titleEn as string;
  return (article.titleDe || article.titleEn || "") as string;
}

export function getLocalizedExcerpt(article: Record<string, unknown>, locale: string): string {
  if (locale === "en" && article.excerptEn) return article.excerptEn as string;
  return (article.excerptDe || article.excerptEn || "") as string;
}

export function getLocalizedCategoryTitle(
  category: Record<string, unknown> | null | undefined,
  locale: string
): string {
  if (!category) return "";
  if (locale === "en" && category.titleEn) return category.titleEn as string;
  return (category.titleDe || "") as string;
}

export function getLocalizedQuestion(item: Record<string, unknown>, locale: string): string {
  if (locale === "en" && item.questionEn) return item.questionEn as string;
  return (item.questionDe || item.questionEn || "") as string;
}

export function getLocalizedShortAnswer(item: Record<string, unknown>, locale: string): string {
  if (locale === "en" && item.shortAnswerEn) return item.shortAnswerEn as string;
  return (item.shortAnswerDe || item.shortAnswerEn || "") as string;
}

/**
 * Returns the appropriate article slug for the given locale.
 * Uses slugEn for English if available, otherwise falls back to the DE slug.
 */
export function getLocalizedSlug(
  article: Record<string, unknown>,
  locale: string
): string {
  const deSlug = (article.slug as { current: string } | string | undefined);
  const enSlug = (article.slugEn as { current: string } | string | undefined);

  const resolveSlug = (s: { current: string } | string | undefined): string | undefined => {
    if (!s) return undefined;
    if (typeof s === "string") return s;
    return s.current;
  };

  if (locale === "en") {
    return resolveSlug(enSlug) || resolveSlug(deSlug) || "";
  }
  return resolveSlug(deSlug) || "";
}
