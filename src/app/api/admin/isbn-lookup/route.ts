import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const isbn = request.nextUrl.searchParams.get("isbn")?.replace(/[-\s]/g, "");
  if (!isbn) return NextResponse.json({ error: "ISBN required" }, { status: 400 });

  if (!/^(97[89])?\d{9}[\dX]$/i.test(isbn)) {
    return NextResponse.json({ error: "Invalid ISBN format" }, { status: 400 });
  }

  try {
    // Try direct ISBN lookup first
    let bookData = await fetchFromOpenLibrary(isbn);

    if (!bookData) {
      // Fallback: search by ISBN
      const searchRes = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&limit=1`);
      if (searchRes.ok) {
        const search = await searchRes.json();
        if (search.docs?.[0]) {
          const doc = search.docs[0];
          bookData = {
            title: doc.title ?? "",
            authors: (doc.author_name ?? []).join(", "),
            year: doc.first_publish_year ?? null,
            publisher: doc.publisher?.[0] ?? "",
            city: doc.publish_place?.[0] ?? "",
            isbn,
          };
        }
      }
    }

    if (!bookData) {
      return NextResponse.json({ error: "ISBN not found" }, { status: 404 });
    }

    return NextResponse.json(bookData);
  } catch {
    return NextResponse.json({ error: "ISBN lookup failed" }, { status: 500 });
  }
}

async function fetchFromOpenLibrary(isbn: string) {
  const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
  if (!res.ok) return null;

  const data = await res.json();
  const title = data.title ?? "";

  // Resolve author references
  const authorKeys: string[] = (data.authors ?? []).map((a: any) => a.key).filter(Boolean);
  const authorNames: string[] = [];
  for (const key of authorKeys) {
    try {
      const authorRes = await fetch(`https://openlibrary.org${key}.json`);
      if (authorRes.ok) {
        const author = await authorRes.json();
        authorNames.push(author.name ?? "");
      }
    } catch {
      // Skip failed author lookups
    }
  }

  // Extract year from publish_date
  const publishDate = data.publish_date ?? "";
  const yearMatch = publishDate.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;

  // Get publisher info
  const publishers = data.publishers ?? [];
  const publishPlaces = data.publish_places ?? [];

  return {
    title,
    authors: authorNames.join(", "),
    year,
    publisher: publishers[0] ?? "",
    city: publishPlaces[0] ?? "",
    isbn,
  };
}
