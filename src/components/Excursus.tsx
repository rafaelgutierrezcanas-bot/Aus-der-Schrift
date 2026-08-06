"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface ExcursusProps {
  title: string;
  locale: string;
  children: React.ReactNode;
}

export function Excursus({ title, locale, children }: ExcursusProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="not-prose my-8 border border-border rounded-sm bg-[var(--color-surface)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <ChevronRight
          size={14}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted block"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Exkurs" : "Excursus"}
          </span>
          <span
            className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </span>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-border">
            <div
              className="text-[0.9375rem] leading-relaxed text-muted-foreground [&>p]:mb-4 [&>p:last-child]:mb-0"
              style={{ fontFamily: "var(--font-body-serif)" }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
