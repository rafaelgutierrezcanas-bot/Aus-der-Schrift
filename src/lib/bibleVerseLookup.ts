import type { BibleRef } from "./bibleReferences";
import { getBibleServerBook } from "./bibleReferences";
import verseData from "@/data/bible-verses-luther1912.json";

const verses = verseData as Record<string, string>;

export interface VerseResult {
  text: string | null;
  translation: string;
  fallbackUrl: string;
}

function buildFallbackUrl(ref: BibleRef): string {
  const bsBook = getBibleServerBook(ref.book);
  const versePart = ref.verseStart
    ? ref.verseEnd
      ? `,${ref.verseStart}-${ref.verseEnd}`
      : `,${ref.verseStart}`
    : "";
  return `https://www.bibleserver.com/LUT/${encodeURIComponent(bsBook)}${ref.chapter}${versePart}`;
}

export function lookupVerse(ref: BibleRef): VerseResult {
  const fallbackUrl = buildFallbackUrl(ref);

  // Single verse or chapter-only reference
  if (!ref.verseStart) {
    // Chapter-only: try verse 1 as a preview
    const key = `${ref.book}.${ref.chapter}.1`;
    const text = verses[key] ?? null;
    return { text, translation: "Luther 1912", fallbackUrl };
  }

  if (!ref.verseEnd) {
    // Single verse
    const key = `${ref.book}.${ref.chapter}.${ref.verseStart}`;
    const text = verses[key] ?? null;
    return { text, translation: "Luther 1912", fallbackUrl };
  }

  // Verse range: assemble from individual verses
  const parts: string[] = [];
  let allFound = true;
  for (let v = ref.verseStart; v <= ref.verseEnd; v++) {
    const key = `${ref.book}.${ref.chapter}.${v}`;
    const text = verses[key];
    if (text) {
      parts.push(text);
    } else {
      allFound = false;
    }
  }

  if (parts.length === 0) {
    return { text: null, translation: "Luther 1912", fallbackUrl };
  }

  // If not all verses found, still return what we have
  const text = parts.join(" ") + (allFound ? "" : " [...]");
  return { text, translation: "Luther 1912", fallbackUrl };
}
