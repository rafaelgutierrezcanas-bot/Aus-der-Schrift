"use client";
import { useEffect, useState, useCallback } from "react";
import { extractHeadings, type PortableTextBlock } from "@/lib/tableOfContents";

export function MobileTableOfContents({
  body,
  label,
}: {
  body: PortableTextBlock[];
  label: string;
}) {
  const headings = extractHeadings(body);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      setOpen(false);
      // Small delay so the sheet closes before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          history.pushState(null, "", `#${id}`);
        }
      }, 150);
    },
    []
  );

  if (headings.length < 3) return null;

  return (
    <div className="lg:hidden">
      {/* Floating button */}
      {visible && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={label}
          className="fixed bottom-8 left-6 z-40 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background text-foreground hover:text-accent transition-colors shadow-sm"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="9" y2="18" />
          </svg>
        </button>
      )}

      {/* Overlay + Sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Sheet */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background shadow-xl px-6 py-5"
            aria-label="Table of contents"
            style={{ animation: "slideUp 200ms ease-out" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-xs uppercase tracking-widest text-muted"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {label}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ul className="space-y-1">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    className={`block py-1.5 leading-relaxed transition-colors pl-3 border-l-2 ${
                      h.level === 3
                        ? "text-[12px]"
                        : "text-[13px] font-medium"
                    } ${
                      active === h.id
                        ? "text-accent border-accent"
                        : "text-muted border-transparent hover:text-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

    </div>
  );
}
