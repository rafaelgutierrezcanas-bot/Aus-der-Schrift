import type { BibliographyEntry } from "./types";

/**
 * Formats a full citation: Autor, *Titel*, Auflage (Ort: Verlag, Jahr), S. X [Funktion].
 */
export function formatCitation(
  entry: BibliographyEntry,
  pages: string,
  fn: string,
): string {
  const author = entry.authors.join(" / ");
  const title = entry.title;
  const parts: string[] = [];

  if (entry.edition) parts.push(entry.edition);

  const locationParts: string[] = [];
  if (entry.place) locationParts.push(entry.place);
  if (entry.publisher) {
    locationParts.push(locationParts.length > 0 ? ` ${entry.publisher}` : entry.publisher);
  }

  let parenthetical = "";
  if (locationParts.length > 0) {
    parenthetical = `${locationParts.join(":")}`;
  }
  if (entry.year) {
    parenthetical = parenthetical
      ? `${parenthetical}, ${entry.year}`
      : `${entry.year}`;
  }

  let result = `${author}, *${title}*`;
  if (parts.length > 0) result += `, ${parts.join(", ")}`;
  if (parenthetical) result += ` (${parenthetical})`;
  if (pages) result += `, S. ${pages}`;
  if (fn) result += ` [${fn}]`;

  return result;
}

/**
 * Short form for repeated references: Autor, *Titel*, S. X.
 */
export function formatShortCitation(
  entry: BibliographyEntry,
  pages: string,
): string {
  const author = entry.authors.join(" / ");
  let result = `${author}, *${entry.title}*`;
  if (pages) result += `, S. ${pages}`;
  return result;
}
