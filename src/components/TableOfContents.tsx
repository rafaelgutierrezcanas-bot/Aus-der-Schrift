"use client";
import { useEffect, useState } from "react";

interface PortableTextBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: Array<{ text: string }>;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(body: PortableTextBlock[]): TocItem[] {
  return body
    .filter((b) => b._type === "block" && (b.style === "h2" || b.style === "h3"))
    .map((b) => ({
      id: b._key,
      text: b.children?.map((c) => c.text).join("") || "",
      level: b.style === "h2" ? 2 : 3,
    }));
}

export function TableOfContents({
  body,
  label,
}: {
  body: PortableTextBlock[];
  label: string;
}) {
  const headings = extractHeadings(body);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "0px 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings.length]);

  if (headings.length < 3) return null;

  return (
    <nav
      className="hidden lg:block sticky top-24 self-start ml-12 min-w-[180px] max-w-[220px] shrink-0"
      aria-label="Table of contents"
    >
      <p
        className="text-xs uppercase tracking-widest text-muted mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              className={`text-xs leading-relaxed hover:text-accent transition-colors ${
                active === h.id ? "text-accent" : "text-muted"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
