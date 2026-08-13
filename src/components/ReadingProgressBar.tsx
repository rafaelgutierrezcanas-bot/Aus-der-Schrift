"use client";

import { useEffect, useRef } from "react";

export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!barRef.current) return;
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const pct =
          scrollable > 0
            ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100))
            : 0;
        barRef.current.style.width = `${pct}%`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "3px",
        zIndex: 50,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          background: "var(--color-accent)",
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
