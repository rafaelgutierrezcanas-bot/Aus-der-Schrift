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
