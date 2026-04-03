import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "./LanguageToggle";
import { client } from "@/sanity/client";
import { allCategoriesQuery } from "@/sanity/queries";
import { getLocalizedCategoryTitle } from "@/lib/utils";

interface HeaderProps {
  locale: string;
}

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations("nav");

  let categories: Record<string, unknown>[] = [];
  try {
    categories = await client.fetch(allCategoriesQuery);
  } catch {
    // show header without categories if Sanity unavailable
  }

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 shrink-0 hover:text-accent transition-colors"
        >
          <span className="text-accent text-lg leading-none">✦</span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Aus der Schrift
          </span>
        </Link>

        {/* Category nav — pill container */}
        <nav className="hidden lg:flex items-center border border-border rounded-full px-1 py-1 gap-0">
          {categories.map((cat, i) => (
            <span key={cat._id as string} className="flex items-center">
              <Link
                href={`/${locale}/kategorien/${(cat.slug as { current: string }).current}`}
                className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {getLocalizedCategoryTitle(cat, locale)}
              </Link>
              {i < categories.length - 1 && (
                <span className="w-px h-3 bg-border shrink-0" />
              )}
            </span>
          ))}
          {categories.length > 0 && (
            <span className="w-px h-3 bg-border shrink-0" />
          )}
          <Link
            href={`/${locale}/blog`}
            className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("blog")}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={`/${locale}/uber-uns`}
            className="hidden md:block text-xs text-muted hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about")}
          </Link>
          <LanguageToggle />
        </div>

      </div>
    </header>
  );
}
