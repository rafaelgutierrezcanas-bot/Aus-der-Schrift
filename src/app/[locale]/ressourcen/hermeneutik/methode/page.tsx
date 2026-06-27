import { client } from "@/sanity/client";
import { allHermeneutikStepsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import { PortableText } from "@portabletext/react";
import type { HermeneutikStep } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function MethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");
  const steps: HermeneutikStep[] = await client.fetch(allHermeneutikStepsQuery);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("method")}
      </h1>
      <p className="mb-12 text-lg" style={{ color: "var(--color-muted)" }}>
        {locale === "de"
          ? "Die hermeneutische Methode in 6 Schritten — zum Nachschlagen und Lernen."
          : "The hermeneutical method in 6 steps — for reference and learning."}
      </p>

      <div className="space-y-12">
        {steps.map((step) => {
          const color = step.accentColor || STEP_COLORS[step.order];
          const explanation = loc<any[]>(step, "explanation", locale);
          const questions = loc<string[]>(step, "guidingQuestions", locale) || [];
          const mistakes = loc<string[]>(step, "commonMistakes", locale) || [];

          return (
            <section
              key={step._id}
              id={step.slug}
              className="rounded-2xl border p-6 md:p-8 scroll-mt-24"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold text-white"
                  style={{ background: color }}
                >
                  {step.order}
                </span>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(step, "title", locale)}
                </h2>
              </div>

              {/* Explanation */}
              {explanation && explanation.length > 0 && (
                <div className="prose dark:prose-invert max-w-none mb-6" style={{ fontFamily: "var(--font-body-serif)" }}>
                  <PortableText value={explanation} />
                </div>
              )}

              {/* Guiding Questions */}
              {questions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: color }}>
                    {t("guidingQuestions")}
                  </h3>
                  <ul className="space-y-2">
                    {questions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                        <span style={{ color }}>?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {mistakes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-muted)" }}>
                    {t("commonMistakes")}
                  </h3>
                  <ul className="space-y-2">
                    {mistakes.map((m, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                        <span className="text-red-400">!</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {step.sources && step.sources.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-muted)" }}>
                    {t("sources")}
                  </h3>
                  <ul className="space-y-1">
                    {step.sources.map((s, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--color-muted)" }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
