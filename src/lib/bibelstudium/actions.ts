"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateSession } from "./session";

export async function bracketInput(formData: FormData): Promise<void> {
  const stationId = formData.get("stationId") as string;
  const unitSlug = formData.get("unitSlug") as string;
  const input = formData.get("input") as string;

  if (!stationId || !unitSlug || !input?.trim()) {
    return;
  }

  const sessionId = await getOrCreateSession();

  const now = new Date();
  const date = now.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { kv } = await import("@/lib/redis");
  await kv.set(`bracket:${sessionId}:${unitSlug}:${stationId}`, {
    content: input.trim(),
    date,
  });

  revalidatePath(`/de/bibelstudium/${unitSlug}`);
  revalidatePath(`/en/bibelstudium/${unitSlug}`);
}
