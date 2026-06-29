import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Convert a given name like "Justin P." or "Philip" to initials "J. P." or "P." */
function toInitials(given: string): string {
  if (!given) return "";
  // Split on spaces and hyphens, keeping hyphens for compound names
  return given
    .split(/[\s]+/)
    .map((part) => {
      // Remove trailing period if present, take first char, add period
      const clean = part.replace(/\.$/, "");
      return clean.charAt(0).toUpperCase() + ".";
    })
    .join(" ");
}

/** Format Crossref author array to APA style: "Family, I. I., & Family2, I." */
function formatAuthors(authors: Array<{ family?: string; given?: string; name?: string }>): string {
  if (!authors || authors.length === 0) return "";

  const formatted = authors.map((a) => {
    if (a.name) return a.name; // Organization author
    const family = a.family ?? "";
    const initials = a.given ? toInitials(a.given) : "";
    return initials ? `${family}, ${initials}` : family;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  // 3+ authors: all but last joined with ", ", then ", & " + last
  return formatted.slice(0, -1).join(", ") + ", & " + formatted[formatted.length - 1];
}

/** Convert page range like "129-150" to "129–150" using en-dash */
function normalizePages(pages: string): string {
  if (!pages) return "";
  return pages.replace(/\s*-\s*/g, "–");
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const doi = request.nextUrl.searchParams.get("doi");
  if (!doi) return NextResponse.json({ error: "DOI required" }, { status: 400 });

  // Basic DOI format validation: must start with "10." and have a suffix
  const DOI_REGEX = /^10\.\d{4,}\/\S+$/;
  if (!DOI_REGEX.test(doi)) {
    return NextResponse.json({ error: "Invalid DOI format" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "Theologik/1.0 (mailto:admin@theologik.org)" },
    });
    if (!res.ok) return NextResponse.json({ error: "DOI not found" }, { status: 404 });

    const data = await res.json();
    const w = data.message;

    const isJournal = w.type === "journal-article";

    const year =
      w.published?.["date-parts"]?.[0]?.[0] ??
      w["published-print"]?.["date-parts"]?.[0]?.[0] ??
      w["published-online"]?.["date-parts"]?.[0]?.[0] ??
      null;

    // For journal articles: use container-title as the journal name (stored in publisher field)
    // For books: use publisher field
    const publisher = isJournal
      ? (w["container-title"]?.[0] ?? "")
      : (w.publisher ?? "");

    return NextResponse.json({
      title: w.title?.[0] ?? "",
      authors: formatAuthors(w.author ?? []),
      year,
      publisher,
      doi,
      type: isJournal ? "journal" : "book",
      // Journal-specific
      volume: w.volume ?? "",
      issue: w.issue ?? "",
      pages: normalizePages(w.page ?? ""),
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
