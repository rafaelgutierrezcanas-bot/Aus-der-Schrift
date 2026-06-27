import { client } from "@/sanity/client";
import { allHermeneutikTextsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { HermeneutikTextSummary } from "@/lib/hermeneutik";
import { loc } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function WerkbankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");
  const texts: HermeneutikTextSummary[] = await client.fetch(allHermeneutikTextsQuery);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("workbench")}
      </h1>
      <p className="mb-10 text-lg" style={{ color: "var(--color-muted)" }}>
        {t("selectText")}
      </p>

      {texts.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>
            {locale === "de" ? "Texte werden bald hinzugefügt." : "Texts will be added soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {texts.map((text) => (
            <Link
              key={text._id}
              href={`/${locale}/ressourcen/hermeneutik/werkbank/${text.slug}`}
              className="group flex items-center justify-between rounded-2xl border p-6 transition-all hover:scale-[1.01]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(text, "title", locale)}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {text.bibleReference}
                </p>
                <div className="flex gap-2 mt-3 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    {t(text.genre)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    {t(text.difficulty)}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
                {t("startAnalysis")} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
