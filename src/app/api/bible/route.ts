import { NextRequest, NextResponse } from "next/server";
import { getBookNum } from "@/lib/bibleReferences";
import verseData from "@/data/bible-verses-luther1912.json";

const localVerses = verseData as Record<string, string>;

interface BollsVerse {
  verse: number;
  text: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");
  const verseStart = searchParams.get("verseStart");
  const verseEnd = searchParams.get("verseEnd");

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing book or chapter" }, { status: 400 });
  }

  const chapterNum = parseInt(chapter, 10);
  const vs = verseStart ? parseInt(verseStart, 10) : undefined;
  const ve = verseEnd ? parseInt(verseEnd, 10) : undefined;

  // Try local JSON first
  const localText = lookupLocal(book, chapterNum, vs, ve);
  if (localText) {
    return NextResponse.json({ text: localText, translation: "Luther 1912" });
  }

  // Fetch from bolls.life API
  const bookNum = getBookNum(book);
  if (!bookNum) {
    return NextResponse.json({ text: null });
  }

  try {
    const res = await fetch(
      `https://bolls.life/get-text/LUT/${bookNum}/${chapterNum}/`,
      { next: { revalidate: 86400 } } // cache 24h
    );
    if (!res.ok) {
      return NextResponse.json({ text: null });
    }

    const verses: BollsVerse[] = await res.json();

    // Extract requested verses
    let text: string;
    if (!vs) {
      // Chapter-only: return verse 1 as preview
      const v1 = verses.find((v) => v.verse === 1);
      text = v1 ? cleanText(v1.text) : "";
    } else if (!ve) {
      // Single verse
      const v = verses.find((v) => v.verse === vs);
      text = v ? cleanText(v.text) : "";
    } else {
      // Verse range
      const parts = verses
        .filter((v) => v.verse >= vs && v.verse <= ve)
        .sort((a, b) => a.verse - b.verse)
        .map((v) => cleanText(v.text));
      text = parts.join(" ");
    }

    if (!text) {
      return NextResponse.json({ text: null });
    }

    return NextResponse.json({ text, translation: "Luther 1912" });
  } catch {
    return NextResponse.json({ text: null });
  }
}

function cleanText(t: string): string {
  // bolls.life sometimes has HTML tags or extra whitespace
  return t.replace(/<[^>]*>/g, "").trim();
}

function lookupLocal(
  book: string,
  chapter: number,
  vs?: number,
  ve?: number
): string | null {
  if (!vs) {
    const key = `${book}.${chapter}.1`;
    return localVerses[key] ?? null;
  }
  if (!ve) {
    const key = `${book}.${chapter}.${vs}`;
    return localVerses[key] ?? null;
  }
  const parts: string[] = [];
  for (let v = vs; v <= ve; v++) {
    const key = `${book}.${chapter}.${v}`;
    const text = localVerses[key];
    if (text) parts.push(text);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}
