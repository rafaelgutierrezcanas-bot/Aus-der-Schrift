import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { BibleVerse } from "./BibleVerse";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

function firstSpanText(value: unknown): string {
  const v = value as { children?: Array<{ text?: string }> };
  return v?.children?.[0]?.text ?? "";
}

const components: PortableTextComponents = {
  types: {
    footnote: ({ value }: { value: Record<string, unknown> }) => {
      const n = (value._fnIndex as number | undefined) ?? "?";
      return (
        <sup className="text-accent font-medium text-xs leading-none" style={{ fontFamily: "var(--font-sans)" }}>
          <a href={`#fn-${n}`} id={`fnref-${n}`} aria-label={`Fußnote ${n}`}>
            [{n}]
          </a>
        </sup>
      );
    },
    image: ({ value }: { value: Record<string, unknown> }) => (
      <figure className="my-8 not-prose">
        <Image
          src={urlFor(value).width(1200).url()}
          alt={(value.alt as string) || ""}
          width={1200}
          height={675}
          className="rounded-sm w-full"
        />
        {typeof value.caption === "string" && (
          <figcaption
            className="mt-2 text-center text-xs text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    bibleVerse: ({
      value,
    }: {
      value: { reference: string; text: string; translation?: string };
    }) => (
      <BibleVerse
        reference={value.reference}
        text={value.text}
        translation={value.translation}
      />
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-1.5 text-[1.0625rem]" style={{ fontFamily: "var(--font-body-serif)" }}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1.5 text-[1.0625rem]" style={{ fontFamily: "var(--font-body-serif)" }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  },
  block: {
    h2: ({ children, value }) => (
      <h2
        id={(value as { _key: string })._key}
        className="text-2xl font-semibold mt-10 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        id={(value as { _key: string })._key}
        className="text-xl font-semibold mt-8 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {children}
      </h3>
    ),

    blockquote: ({ children, value }) => {
      const ft = firstSpanText(value);

      // ❓ Question callout
      if (ft.startsWith("❓") || ft.startsWith("❔")) {
        return (
          <div
            className="not-prose my-7 rounded-r-md border-l-[3px] border-accent bg-[var(--color-surface)] px-5 py-4"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Frage
            </p>
            <p className="italic leading-relaxed text-[1rem] text-foreground">
              {children}
            </p>
          </div>
        );
      }

      // 📌 Explanation / definition callout
      if (ft.startsWith("📌")) {
        return (
          <div
            className="not-prose my-7 rounded-sm border border-border bg-[var(--color-surface)] px-5 py-4"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Erklärung
            </p>
            <div className="text-[0.9375rem] leading-relaxed text-foreground">
              {children}
            </div>
          </div>
        );
      }

      // Regular quoted blockquote
      return (
        <blockquote
          className="not-prose my-7 border-l-2 border-border pl-5 py-1"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          <div className="text-[1rem] italic leading-relaxed text-muted">
            {children}
          </div>
        </blockquote>
      );
    },

    normal: ({ children }) => (
      <p
        className="leading-relaxed mb-5 text-[1.0625rem]"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {children}
      </p>
    ),
  },
};

export function PortableTextRenderer({ value }: { value: unknown[] }) {
  return (
    <PortableText
      value={value as Parameters<typeof PortableText>[0]["value"]}
      components={components}
    />
  );
}
