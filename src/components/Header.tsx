import Link from "next/link";
import { LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { TheologikLogo } from "./TheologikLogo";

interface HeaderProps {
  locale: string;
}

const themen = [
  { label: "Kirchengeschichte", slug: "kirchengeschichte" },
  { label: "Bibelauslegung", slug: "bibelauslegung" },
  { label: "Theologie", slug: "theologie" },
  { label: "Buchgedanken", slug: "buchgedanken" },
];

export function Header({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="shrink-0 hover:opacity-75 transition-opacity"
          aria-label="Theologik – Startseite"
        >
          <TheologikLogo className="h-7 w-auto text-foreground" />
        </Link>

        {/* Category nav — pill container */}
        <nav className="hidden lg:flex items-center border border-border rounded-full px-1 py-1 gap-0">

          {/* Über mich dropdown */}
          <div className="relative group">
            <span
              className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap flex items-center gap-1 cursor-default"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Über mich
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="opacity-50">
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="absolute top-[calc(100%+6px)] left-0 hidden group-hover:block bg-background border border-border rounded-lg shadow-lg py-1 min-w-[170px] z-50">
              <Link
                href={`/${locale}/zu-meiner-person`}
                className="block px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Zu meiner Person
              </Link>
              <Link
                href={`/${locale}/impressum`}
                className="block px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Impressum
              </Link>
            </div>
          </div>

          <span className="w-px h-3 bg-border shrink-0" />

          {/* Themen dropdown */}
          <div className="relative group">
            <span
              className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap flex items-center gap-1 cursor-default"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Themen
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="opacity-50">
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="absolute top-[calc(100%+6px)] left-0 hidden group-hover:block bg-background border border-border rounded-lg shadow-lg py-1 min-w-[170px] z-50">
              {themen.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${locale}/kategorien/${t.slug}`}
                  className="block px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          <span className="w-px h-3 bg-border shrink-0" />

          {/* Ressourcen */}
          <Link
            href={`/${locale}/ressourcen`}
            className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Ressourcen
          </Link>

        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${locale}/kontakt`}
            className="hidden md:inline-flex items-center text-xs px-4 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Kontakt
          </Link>
          <DarkModeToggle />
          <LanguageToggle />
        </div>

      </div>
    </header>
  );
}
