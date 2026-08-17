"use client";

import { Lightbulb } from "lucide-react";

interface ApplicationProps {
  title?: string;
  locale: string;
  children: React.ReactNode;
}

export function Application({ title, locale, children }: ApplicationProps) {
  return (
    <aside className="not-prose my-8 border border-emerald-200 rounded-sm bg-emerald-50/60">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-emerald-200">
        <Lightbulb size={14} className="shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600 block"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Anwendung" : "Application"}
          </span>
          {title && (
            <span
              className="text-sm font-medium text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {title}
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-4">
        <div
          className="text-[0.9375rem] leading-relaxed text-muted-foreground [&>p]:mb-4 [&>p:last-child]:mb-0"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
