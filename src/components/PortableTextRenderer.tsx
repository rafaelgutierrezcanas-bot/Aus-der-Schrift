import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { BibleVerse } from "./BibleVerse";
import Image from "next/image";
import { urlFor } from "@/sanity/image";

const components: PortableTextComponents = {
  types: {
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
    blockquote: ({ children }) => (
      <blockquote className="pl-6 border-l-2 border-border my-6 italic text-muted">
        {children}
      </blockquote>
    ),
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
