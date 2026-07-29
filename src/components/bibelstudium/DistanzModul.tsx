"use client";

import { useState, useCallback, useId } from "react";
import type { DistanceItem } from "@/lib/bibelstudium/types";

interface DistanzModulProps {
  items: DistanceItem[];
  selfTestAnswers: string[];
  totalOptions: number;
}

export function DistanzModul({ items, selfTestAnswers, totalOptions }: DistanzModulProps) {
  return (
    <div className="my-8">
      <p
        className="text-sm text-muted mb-6"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Von {totalOptions} Wendungen konntest du {selfTestAnswers.length} erklären.
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <DistanzKarte key={item.phrase} item={item} />
        ))}
      </div>
    </div>
  );
}

function DistanzKarte({ item }: { item: DistanceItem }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div className="border border-border">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-surface/50 transition-colors min-h-[44px]"
      >
        <span
          className="text-xs text-muted uppercase tracking-widest shrink-0 mr-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {item.category}
        </span>
        <span
          className="text-navy text-right"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {item.phrase}
        </span>
      </button>

      <div
        id={contentId}
        className="overflow-hidden transition-[max-height] duration-200 ease-out motion-reduce:transition-none"
        style={{ maxHeight: open ? "500px" : "0px" }}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-border pt-4">
            <p
              className="text-navy"
              style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
            >
              {item.explanation}
            </p>

            {item.translations && item.translations.length > 0 && (
              <div className="mt-4 space-y-2">
                {item.translations.map((t) => (
                  <p
                    key={t.sigel}
                    className="text-navy text-sm"
                    style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
                  >
                    <span
                      className="text-xs text-muted uppercase tracking-widest mr-2"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {t.sigel}
                    </span>
                    {t.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
