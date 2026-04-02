"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  }

  return (
    <div className="flex items-center gap-1 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
      <button
        onClick={() => switchLocale("de")}
        className={`transition-colors ${locale === "de" ? "text-accent font-medium" : "text-muted hover:text-foreground"}`}
      >
        DE
      </button>
      <span className="text-muted">/</span>
      <button
        onClick={() => switchLocale("en")}
        className={`transition-colors ${locale === "en" ? "text-accent font-medium" : "text-muted hover:text-foreground"}`}
      >
        EN
      </button>
    </div>
  );
}
