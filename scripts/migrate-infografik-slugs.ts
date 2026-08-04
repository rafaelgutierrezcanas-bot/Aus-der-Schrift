/**
 * Migration: Generate slugs and alt texts for existing infographics.
 *
 * Usage:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx NEXT_PUBLIC_SANITY_DATASET=production SANITY_API_WRITE_TOKEN=xxx npx tsx scripts/migrate-infografik-slugs.ts
 *
 * Or set the env vars in .env.local first, then just run:
 *   npx tsx scripts/migrate-infografik-slugs.ts
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function migrate() {
  const infografiken = await client.fetch<
    Array<{
      _id: string;
      title: string;
      slug?: { current: string };
      alt?: string;
      description?: string;
    }>
  >(`*[_type == "infografik"]{ _id, title, slug, alt, description }`);

  console.log(`Found ${infografiken.length} infographics`);

  for (const info of infografiken) {
    const patches: Record<string, unknown> = {};

    // Generate slug if missing
    if (!info.slug?.current) {
      patches.slug = { _type: "slug", current: slugify(info.title) };
      console.log(`  [slug] ${info.title} → ${patches.slug.current}`);
    }

    // Generate alt text if missing (use title as base)
    if (!info.alt) {
      patches.alt = `Infografik: ${info.title}`;
      console.log(`  [alt]  ${info.title} → ${patches.alt}`);
    }

    if (Object.keys(patches).length > 0) {
      await client.patch(info._id).set(patches).commit();
      console.log(`  ✓ Updated ${info.title}`);
    } else {
      console.log(`  – ${info.title} (already has slug + alt)`);
    }
  }

  console.log("\nDone!");
}

migrate().catch(console.error);
