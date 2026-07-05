"use client";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

const STORAGE_KEY = "theologik-font-size";
const SIZES = [0.9, 1, 1.0625, 1.125, 1.25];
const DEFAULT_INDEX = 2; // 1.0625rem — matches current body text size

export function FontSizeControls() {
  const [index, setIndex] = useState(DEFAULT_INDEX);

  // Load persisted preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const i = parseInt(stored, 10);
      if (i >= 0 && i < SIZES.length) setIndex(i);
    }
  }, []);

  // Apply font size to article body
  useEffect(() => {
    const root = document.getElementById("article-body");
    if (root) root.style.fontSize = `${SIZES[index]}rem`;
    localStorage.setItem(STORAGE_KEY, String(index));
  }, [index]);

  return (
    <div
      className="flex items-center gap-1"
      aria-label="Schriftgröße"
      role="group"
    >
      <button
        type="button"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0}
        className="text-muted hover:text-accent disabled:opacity-30 transition-colors p-1"
        style={{ fontFamily: "var(--font-sans)" }}
        aria-label="Schriftgröße verkleinern"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setIndex((i) => Math.min(SIZES.length - 1, i + 1))}
        disabled={index === SIZES.length - 1}
        className="text-muted hover:text-accent disabled:opacity-30 transition-colors p-1"
        style={{ fontFamily: "var(--font-sans)" }}
        aria-label="Schriftgröße vergrößern"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
