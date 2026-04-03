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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
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

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat._id as string}
              href={`/${locale}/kategorien/${(cat.slug as { current: string }).current}`}
              className="text-xs px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-border/60 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {getLocalizedCategoryTitle(cat, locale)}
            </Link>
          ))}
          <Link
            href={`/${locale}/blog`}
            className="text-xs px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-border/60 transition-colors"
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
