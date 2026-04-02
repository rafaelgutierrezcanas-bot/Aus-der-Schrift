import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  locale: string;
}

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-xl font-semibold tracking-tight hover:text-accent transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Aus der Schrift
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href={`/${locale}/blog`}
            className="text-sm text-muted hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("blog")}
          </Link>
          <Link
            href={`/${locale}/uber-uns`}
            className="text-sm text-muted hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about")}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
