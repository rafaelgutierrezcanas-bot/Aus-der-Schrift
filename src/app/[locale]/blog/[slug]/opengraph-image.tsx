import { ImageResponse } from "next/og";
import { client } from "@/sanity/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Theologik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ogArticleQuery = `*[_type == "article" && slug.current == $slug && (status == "published" || !defined(status))][0]{
  titleDe, titleEn, "categoryDe": category->titleDe, "categoryEn": category->titleEn
}`;

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const fontsDir = join(process.cwd(), "public", "fonts");
  const [playfairData, interData] = await Promise.all([
    readFile(join(fontsDir, "PlayfairDisplay-Bold.ttf")),
    readFile(join(fontsDir, "Inter-SemiBold.ttf")),
  ]);

  let article: {
    titleDe?: string;
    titleEn?: string;
    categoryDe?: string;
    categoryEn?: string;
  } | null = null;
  try {
    article = await client.fetch(ogArticleQuery, { slug });
  } catch {
    /* fallback to generic */
  }

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#faf8f5",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontFamily: "Playfair Display",
              fontWeight: 700,
              color: "#1B2D4F",
              letterSpacing: "-3px",
              lineHeight: 1,
              marginBottom: 28,
            }}
          >
            THEOLOGIK
          </div>
          <div
            style={{
              width: 64,
              height: 2,
              background: "#C4933A",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontFamily: "Inter",
              color: "#8b7d6b",
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
            }}
          >
            Theologie · Bibelauslegung · Kirchengeschichte
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: "Playfair Display", data: playfairData, weight: 700 },
          { name: "Inter", data: interData, weight: 600 },
        ],
      }
    );
  }

  const title =
    locale === "en" && article.titleEn ? article.titleEn : (article.titleDe ?? "");
  const category =
    locale === "en" && article.categoryEn
      ? article.categoryEn
      : (article.categoryDe ?? "");

  const titleLen = title.length;
  const titleSize = titleLen > 80 ? 36 : titleLen > 60 ? 42 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf8f5",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
        }}
      >
        {/* Top: Category */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {category && (
            <div
              style={{
                fontSize: 16,
                fontFamily: "Inter",
                fontWeight: 600,
                color: "#C4933A",
                textTransform: "uppercase" as const,
                letterSpacing: "4px",
                marginBottom: 24,
              }}
            >
              {category}
            </div>
          )}
          {/* Gold divider */}
          <div
            style={{
              width: 56,
              height: 3,
              background: "#C4933A",
              marginBottom: 32,
            }}
          />
          {/* Title */}
          <div
            style={{
              fontSize: titleSize,
              fontFamily: "Playfair Display",
              fontWeight: 700,
              color: "#1B2D4F",
              lineHeight: 1.2,
              maxWidth: "90%",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontFamily: "Inter",
              fontWeight: 600,
              color: "#1B2D4F",
              letterSpacing: "6px",
              textTransform: "uppercase" as const,
            }}
          >
            THEOLOGIK
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: "Inter",
              color: "#8b7d6b",
              letterSpacing: "2px",
            }}
          >
            theologik.org
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair Display", data: playfairData, weight: 700 },
        { name: "Inter", data: interData, weight: 600 },
      ],
    }
  );
}
