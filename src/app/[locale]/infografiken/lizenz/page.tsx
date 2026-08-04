import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/infografiken/lizenz",
    deTitle: "Infografiken-Lizenz — CC BY 4.0",
    enTitle: "Infographics License — CC BY 4.0",
    deDescription:
      "Alle Infografiken auf Theologik sind unter der Creative Commons Namensnennung 4.0 International Lizenz (CC BY 4.0) veröffentlicht.",
    enDescription:
      "All infographics on Theologik are published under the Creative Commons Attribution 4.0 International License (CC BY 4.0).",
  });
}

export default async function LizenzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDe = locale === "de";

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <Link
        href={`/${locale}/ressourcen/infografiken`}
        className="text-sm mb-8 inline-block transition-colors hover:text-accent"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
      >
        &larr; {isDe ? "Zurück zu Infografiken" : "Back to Infographics"}
      </Link>

      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDe ? "Lizenz für Infografiken" : "Infographics License"}
      </h1>

      <div
        className="prose dark:prose-invert leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {isDe ? (
          <>
            <p>
              Alle Infografiken auf Theologik sind unter der{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                Creative Commons Namensnennung 4.0 International Lizenz (CC BY 4.0)
              </a>{" "}
              veröffentlicht.
            </p>

            <h2>Was bedeutet das?</h2>
            <p>Du darfst die Infografiken:</p>
            <ul>
              <li><strong>Teilen</strong> — in jedwedem Format oder Medium vervielfältigen und weiterverbreiten</li>
              <li><strong>Bearbeiten</strong> — remixen, verändern und darauf aufbauen, und zwar für beliebige Zwecke, sogar kommerziell</li>
            </ul>

            <h2>Unter folgender Bedingung</h2>
            <p>
              <strong>Namensnennung</strong> — Du musst angemessene Urheber- und Rechteangaben machen und einen Link zur Lizenz beifügen.
              Am einfachsten geht das so:
            </p>
            <div
              className="bg-[var(--color-surface)] border border-border rounded-lg p-4 not-prose text-sm"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Grafik: Rafael Gutierrez, theologik.org — Lizenz: CC BY 4.0
            </div>

            <h2>Einbettung</h2>
            <p>
              Auf jeder Infografik-Seite findest du einen fertigen Embed-Code.
              Wenn du diesen verwendest, ist die Quellenangabe automatisch enthalten.
            </p>
          </>
        ) : (
          <>
            <p>
              All infographics on Theologik are published under the{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Creative Commons Attribution 4.0 International License (CC BY 4.0)
              </a>.
            </p>

            <h2>What does this mean?</h2>
            <p>You are free to:</p>
            <ul>
              <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
              <li><strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially</li>
            </ul>

            <h2>Under the following condition</h2>
            <p>
              <strong>Attribution</strong> — You must give appropriate credit and provide a link to the license.
              The simplest way:
            </p>
            <div
              className="bg-[var(--color-surface)] border border-border rounded-lg p-4 not-prose text-sm"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Graphic: Rafael Gutierrez, theologik.org — License: CC BY 4.0
            </div>

            <h2>Embedding</h2>
            <p>
              Each infographic page includes a ready-to-use embed code.
              When you use it, attribution is automatically included.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
