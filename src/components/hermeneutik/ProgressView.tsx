"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { loadProgress, type HermeneutikProgress } from "@/lib/hermeneutik";

export function ProgressView() {
  const t = useTranslations("hermeneutik");
  const locale = useLocale();
  const [progress, setProgress] = useState<HermeneutikProgress>({ analyses: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const analyses = Object.values(progress.analyses);
  const completed = analyses.filter((a) => a.completedAt);
  const inProgress = analyses.filter((a) => !a.completedAt);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("progress")}
      </h1>
      <p className="mb-10 text-lg" style={{ color: "var(--color-muted)" }}>
        {t("completedAnalyses")}
      </p>

      {analyses.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p className="mb-4" style={{ color: "var(--color-muted)" }}>
            {t("noAnalysesYet")}
          </p>
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {t("startAnalysis")}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-muted)" }}>
                {t("inProgress")}
              </h2>
              <div className="space-y-3">
                {inProgress.map((a) => (
                  <Link
                    key={a.textSlug}
                    href={`/${locale}/ressourcen/hermeneutik/werkbank/${a.textSlug}`}
                    className="flex items-center justify-between rounded-2xl border p-5 transition-all hover:scale-[1.01]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.textSlug}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                        {t("stepOf", { current: a.currentStep, total: 6 })}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-accent)" }}>
                      {t("continueAnalysis")} →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-muted)" }}>
                {t("completed")}
              </h2>
              <div className="space-y-3">
                {completed.map((a) => (
                  <div
                    key={a.textSlug}
                    className="flex items-center justify-between rounded-2xl border p-5"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.textSlug}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")
                          : ""}
                      </p>
                    </div>
                    <svg className="w-5 h-5" style={{ color: "var(--color-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
