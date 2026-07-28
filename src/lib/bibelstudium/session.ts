import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "bs-session";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);

  if (existing?.value) {
    return existing.value;
  }

  const sessionId = crypto.randomUUID();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });

  return sessionId;
}
