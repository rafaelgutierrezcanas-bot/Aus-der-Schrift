import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

// In-memory rate limit: 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_LENGTH = 2000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Zu viele Kommentare. Bitte warte eine Stunde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { articleId, authorName, authorEmail, body: commentBody } =
    body as Record<string, unknown>;

  if (
    typeof articleId !== "string" ||
    typeof authorName !== "string" ||
    typeof commentBody !== "string"
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  if (
    articleId.trim().length === 0 ||
    authorName.trim().length === 0 ||
    commentBody.trim().length === 0
  ) {
    return NextResponse.json({ error: "Felder dürfen nicht leer sein" }, { status: 400 });
  }

  if (authorName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name zu lang" }, { status: 400 });
  }
  if (commentBody.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "Kommentar zu lang (max. 2000 Zeichen)" }, { status: 400 });
  }
  if (authorEmail !== undefined && authorEmail !== null) {
    if (typeof authorEmail !== "string" || authorEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
    }
  }

  const doc: { _type: string; article: { _type: string; _ref: string }; authorName: string; body: string; status: string; authorEmail?: string } = {
    _type: "comment",
    article: { _type: "reference", _ref: articleId.trim() },
    authorName: authorName.trim(),
    body: commentBody.trim(),
    status: "pending",
  };
  if (typeof authorEmail === "string" && authorEmail.trim()) {
    doc.authorEmail = authorEmail.trim();
  }

  try {
    await writeClient.create(doc);
  } catch (err) {
    console.error("[POST /api/comments] Sanity write failed:", err);
    return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
