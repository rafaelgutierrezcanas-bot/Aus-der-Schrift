"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateSession } from "./session";

export async function bracketInput(formData: FormData): Promise<void> {
  const stationId = formData.get("stationId") as string;
  const unitSlug = formData.get("unitSlug") as string;
  const answersJson = formData.get("answers") as string;

  if (!stationId || !unitSlug || !answersJson) {
    return;
  }

  let answers: Record<string, string | string[]>;
  try {
    answers = JSON.parse(answersJson);
  } catch {
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
    answers,
    date,
  });

  revalidatePath(`/de/bibelstudium/${unitSlug}`);
  revalidatePath(`/en/bibelstudium/${unitSlug}`);
}

export async function savePrediction(formData: FormData): Promise<void> {
  const stationId = formData.get("stationId") as string;
  const unitSlug = formData.get("unitSlug") as string;
  const prediction = formData.get("prediction") as string;

  if (!stationId || !unitSlug || !prediction?.trim()) {
    return;
  }

  const sessionId = await getOrCreateSession();

  const { kv } = await import("@/lib/redis");
  await kv.set(`prediction:${sessionId}:${unitSlug}:${stationId}`, {
    prediction: prediction.trim(),
    date: new Date().toISOString(),
  });
}
