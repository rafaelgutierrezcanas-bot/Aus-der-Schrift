import { client } from "@/sanity/client";
import { allHermeneutikStepsQuery, allHermeneutikTextsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { HermeneutikStep, HermeneutikTextSummary } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen/hermeneutik",
    deTitle: "Hermeneutik lernen",
    enTitle: "Learn Hermeneutics",
    deDescription:
      "Interaktives Lernprogramm für biblische Textanalyse – lerne die hermeneutische Methode Schritt für Schritt.",
    enDescription:
      "Interactive learning program for biblical text analysis – learn the hermeneutical method step by step.",
    keywords: [
      "Hermeneutik lernen",
      "biblische Hermeneutik",
      "Bibelauslegung Methode",
      "Textanalyse Bibel",
      "exegetische Methode",
      "Schriftauslegung",
    ],
  });
}

export default async function HermeneutikOverview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");

  const [steps, texts]: [HermeneutikStep[], HermeneutikTextSummary[]] =
    await Promise.all([
      client.fetch(allHermeneutikStepsQuery),
      client.fetch(allHermeneutikTextsQuery),
    ]);

  return (
    <div>
      {/* Hero */}
      <section className="mb-16">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("title")}
        </h1>
        <p
          className="text-lg max-w-2xl"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
        >
          {t("description")}
        </p>
      </section>

      {/* Die 6 Schritte */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Die 6 Analyse-Schritte" : "The 6 Analysis Steps"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step) => (
            <Link
              key={step._id}
              href={`/${locale}/ressourcen/hermeneutik/methode#${step.slug}`}
              className="group rounded-2xl border p-5 transition-all hover:scale-[1.02]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
                  style={{ background: step.accentColor || STEP_COLORS[step.order] }}
                >
                  {step.order}
                </span>
                <h3 className="font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                  {loc<string>(step, "title", locale)}
                </h3>
              </div>
              {step.guidingQuestionsDe && step.guidingQuestionsDe.length > 0 && (
                <p className="text-sm line-clamp-2" style={{ color: "var(--color-muted)" }}>
                  {loc<string[]>(step, "guidingQuestions", locale)?.[0]}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Verfügbare Texte */}
      <section>
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("selectText")}
        </h2>
        {texts.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>
            {locale === "de" ? "Texte werden bald hinzugefügt." : "Texts will be added soon."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {texts.map((text) => (
              <Link
                key={text._id}
                href={`/${locale}/ressourcen/hermeneutik/werkbank/${text.slug}`}
                className="group rounded-2xl border p-5 transition-all hover:scale-[1.02]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                <h3 className="font-medium mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(text, "title", locale)}
                </h3>
                <div className="flex gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                  <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-border)" }}>
                    {t(text.genre)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-border)" }}>
                    {t(text.difficulty)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
