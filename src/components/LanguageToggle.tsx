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
    <div
      className="flex items-center rounded-full border border-border p-0.5 text-xs"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <button
        onClick={() => switchLocale("de")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          locale === "de"
            ? "bg-accent text-white font-medium"
            : "text-muted hover:text-foreground"
        }`}
      >
        DE
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          locale === "en"
            ? "bg-accent text-white font-medium"
            : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
