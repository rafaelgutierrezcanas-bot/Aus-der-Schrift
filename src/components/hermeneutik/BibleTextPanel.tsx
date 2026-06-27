"use client";

import { PortableText } from "@portabletext/react";

interface Props {
  content: any[];
  markedWords: string[];
  onWordClick?: (word: string) => void;
  accentColor: string;
}

export function BibleTextPanel({ content, markedWords, onWordClick, accentColor }: Props) {
  return (
    <div
      className="rounded-2xl border p-6 h-full overflow-y-auto"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
        fontFamily: "var(--font-body-serif)",
      }}
    >
      <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <PortableText value={content} />
      </div>
    </div>
  );
}
