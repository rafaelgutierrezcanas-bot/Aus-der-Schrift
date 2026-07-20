import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const query = request.nextUrl.searchParams.get("q");
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      limit: "5",
      fields: "title,authors,year,abstract,externalIds,url,citationCount,openAccessPdf",
    });

    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?${params}`,
      {
        headers: {
          "User-Agent": "Theologik/1.0 (mailto:admin@theologik.org)",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Semantic Scholar API error" }, { status: res.status });
    }

    const data = await res.json();

    const results = (data.data ?? []).map((paper: any) => ({
      title: paper.title ?? "",
      authors: (paper.authors ?? []).map((a: any) => a.name).join(", "),
      year: paper.year ?? null,
      abstract: paper.abstract ?? "",
      doi: paper.externalIds?.DOI ?? null,
      url: paper.url ?? "",
      pdfUrl: paper.openAccessPdf?.url ?? null,
      citationCount: paper.citationCount ?? 0,
    }));

    return NextResponse.json({ results, total: data.total ?? 0 });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
