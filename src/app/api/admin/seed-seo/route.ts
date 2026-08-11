import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

/**
 * Temporary one-time route to set slugEn + seoTitleEn on all published articles.
 * DELETE THIS FILE AFTER USE.
 */

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''"":–—]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// Keyword-optimized SEO titles for English (max ~60 chars)
const SEO_TITLE_MAP: Record<string, string> = {
  // Key = German slug → Value = keyword-optimized English SEO title
  "markus-1-35-39-denn-dazu-bin-ich-ausgegangen": "Mark 1:35-39 Commentary: Jesus' Prayer and Mission",
  "kultureller-hintergrund-korinth": "Ancient Corinth: Culture and Religion in Paul's Day",
  "praeskript-der-paulusbriefe": "New Testament Letter Openings Explained: Paul's Greetings",
  "wuestenmotiv-markusevangelium-prolog": "Mark 1:1-13: Wilderness Motif in Mark's Prologue",
  "gemeindezucht-1-korinther-5": "Church Discipline in 1 Corinthians 5: Biblical Guide",
  "die-erklaerende-kraft-des-glaubens-ein-apologetischer-zugang-fuer-eine-saekulare-zeit": "Sharing Faith in a Secular World: An Apologetics Approach",
  "die-bruederbewegung-historischer-hintergrund-und-fruehe-entwicklung": "Brethren Movement History: John Nelson Darby & Origins",
  "die-theologie-des-dispensationalismus": "Dispensationalism Explained: Theology & Key Beliefs",
  "christlich-zeit-nutzen": "Christian Time Management: Biblical Productivity Principles",
  "lehrt-die-didache-kindertaufe": "Does the Didache Teach Infant Baptism? Early Church Evidence",
  "gottheit-jesu-vor-nicaea": "Divinity of Jesus Before Nicaea: Early Church Evidence",
  "taktik-klar-denken-klug-fragen": "Tactics by Greg Koukl: Book Review & Key Takeaways",
  "gemeindestruktur-fruehe-gemeinde": "Early Church Structure: How First Congregations Were Led",
  "geistliche-gewohnheiten-jim-elliot": "Jim Elliot's Spiritual Habits: Lessons for Fruitful Living",
  "produktiv-fuer-gott": "Productive for God: Christian Principles for Daily Life",
};

export async function GET() {
  try {
    const articles = await client.fetch<
      Array<{
        _id: string;
        titleEn?: string;
        titleDe?: string;
        slug: { current: string };
        slugEn?: { current: string };
        seoTitleEn?: string;
      }>
    >(
      `*[_type == "article" && (status == "published" || !defined(status))] {
        _id,
        titleEn,
        titleDe,
        slug,
        slugEn,
        seoTitleEn
      }`
    );

    const results: string[] = [];

    for (const article of articles) {
      const deSlug = article.slug.current;
      const patches: Record<string, unknown> = {};

      // Set slugEn if missing and titleEn exists
      if (!article.slugEn?.current && article.titleEn) {
        const newSlug = toSlug(article.titleEn);
        patches["slugEn"] = { _type: "slug", current: newSlug };
      }

      // Set seoTitleEn from mapping or generate from titleEn
      if (!article.seoTitleEn) {
        const mapped = SEO_TITLE_MAP[deSlug];
        if (mapped) {
          patches["seoTitleEn"] = mapped;
        } else if (article.titleEn) {
          // Use titleEn as-is if no mapping exists (still better than nothing)
          patches["seoTitleEn"] = article.titleEn;
        }
      }

      if (Object.keys(patches).length > 0) {
        await writeClient.patch(article._id).set(patches).commit();
        results.push(
          `✓ ${deSlug}: ${Object.keys(patches).join(", ")}`
        );
      } else {
        results.push(`– ${deSlug}: already set`);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
