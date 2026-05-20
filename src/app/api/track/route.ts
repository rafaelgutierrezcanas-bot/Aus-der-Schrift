import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/redis";
import { createHash } from "crypto";

const BOT_UA = /bot|crawler|spider|scraper|headless|lighthouse|pingdom|uptimerobot/i;

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT_UA.test(ua)) return NextResponse.json({ ok: true });

    const body = await req.json().catch(() => null);
    const path: string = body?.path ?? "";
    const referrer: string = body?.referrer ?? "";

    if (!path || typeof path !== "string") return NextResponse.json({ ok: true });

    // Anonymize visitor: hash IP + UA + daily salt. Never store raw IP.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const visitorHash = createHash("sha256")
      .update(`${ip}|${ua}|${today}|theologik-analytics`)
      .digest("hex");

    // Normalize referrer: store only domain, not full URL
    let referrerDomain = "direct";
    if (referrer) {
      try {
        referrerDomain = new URL(referrer).hostname.replace(/^www\./, "");
      } catch {
        // malformed referrer header → treat as direct
      }
    }

    // Normalize path: strip locale prefix (/de, /en) for consistent grouping
    const normalizedPath = path.replace(/^\/(de|en)(\/|$)/, "/").replace(/\/$/, "") || "/";

    const TTL = 60 * 60 * 24 * 92; // 92 days in seconds

    await Promise.all([
      kv.incr(`views:day:${today}:${normalizedPath}`),
      kv.incr(`views:total:${normalizedPath}`),
      kv.sadd(`visitors:day:${today}`, visitorHash),
      kv.hincrby(`referrers:${today}`, referrerDomain, 1),
    ]);

    // Set TTL on daily keys (best effort)
    await Promise.allSettled([
      kv.expire(`views:day:${today}:${normalizedPath}`, TTL),
      kv.expire(`visitors:day:${today}`, TTL),
      kv.expire(`referrers:${today}`, TTL),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    // Never let analytics errors surface to users
    return NextResponse.json({ ok: true });
  }
}
