"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // user dismissed the share sheet — ignore
        } else {
          console.error("navigator.share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard write failed:", err);
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors"
      style={{ fontFamily: "var(--font-sans)" }}
      aria-label="Artikel teilen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Kopiert!" : "Teilen"}
    </button>
  );
}
