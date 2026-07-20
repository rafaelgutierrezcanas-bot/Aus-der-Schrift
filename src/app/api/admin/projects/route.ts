import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const projects = await client.fetch(`
    *[_type == "project"] | order(title asc) {
      _id, title, titleEn, description, descriptionEn, slug,
      status, startedAt,
      researchQuestionDe, researchQuestionEn,
      plannedOutput, isPublic
    }
  `);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "project", ...body });
  revalidatePath("/", "layout");
  return NextResponse.json(doc, { status: 201 });
}
