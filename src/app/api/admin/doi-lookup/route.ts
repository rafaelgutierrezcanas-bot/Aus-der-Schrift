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

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const doi = request.nextUrl.searchParams.get("doi");
  if (!doi) return NextResponse.json({ error: "DOI required" }, { status: 400 });

  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "Theologik/1.0 (mailto:admin@theologik.org)" },
    });
    if (!res.ok) return NextResponse.json({ error: "DOI not found" }, { status: 404 });

    const data = await res.json();
    const w = data.message;

    const authors = (w.author ?? [])
      .map((a: { family?: string; given?: string }) =>
        [a.family, a.given].filter(Boolean).join(", ")
      )
      .join("; ");

    const year =
      w.published?.["date-parts"]?.[0]?.[0] ??
      w["published-print"]?.["date-parts"]?.[0]?.[0] ??
      null;

    return NextResponse.json({
      title: w.title?.[0] ?? "",
      authors,
      year,
      publisher: w.publisher ?? w["container-title"]?.[0] ?? "",
      doi,
      type: w.type === "journal-article" ? "journal" : "book",
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
