"use client";
import { useEffect, useState, useCallback } from "react";
import { extractHeadings, type PortableTextBlock } from "@/lib/tableOfContents";

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

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    }
  }, []);

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
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block leading-relaxed transition-colors pl-3 border-l-2 ${
                h.level === 3
                  ? "text-[11px]"
                  : "text-[13px] font-medium"
              } ${
                active === h.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent hover:text-foreground hover:border-border"
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
