"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { TheologikLogo } from "./TheologikLogo";

interface HeaderProps {
  locale: string;
}

const themen: Record<string, { de: string; en: string; slug: string }[]> = {
  de: [
    { de: "Kirchengeschichte", en: "Church History", slug: "kirchengeschichte" },
    { de: "Bibelauslegung", en: "Biblical Interpretation", slug: "bibelauslegung" },
    { de: "Theologie", en: "Theology", slug: "theologie" },
    { de: "Buchgedanken", en: "Book Thoughts", slug: "buchgedanken" },
  ],
  en: [
    { de: "Kirchengeschichte", en: "Church History", slug: "kirchengeschichte" },
    { de: "Bibelauslegung", en: "Biblical Interpretation", slug: "bibelauslegung" },
    { de: "Theologie", en: "Theology", slug: "theologie" },
    { de: "Buchgedanken", en: "Book Thoughts", slug: "buchgedanken" },
  ],
};

const CREAM = "#EDE5D8";
const CREAM_MUTED = "rgba(237,229,216,0.6)";

export function Header({ locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent only on homepage when not yet scrolled
  const atTop = isHomepage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        atTop
          ? "border-b border-transparent"
          : "bg-background shadow-sm border-b border-border"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="shrink-0 hover:opacity-75 transition-opacity"
          aria-label={locale === "de" ? "Theologik – Startseite" : "Theologik – Home"}
        >
          <TheologikLogo
            className="h-7 w-auto transition-colors duration-300"
            style={{ color: atTop ? CREAM : "var(--color-foreground)" }}
          />
        </Link>

        {/* Category nav — pill container */}
        <nav
          className={`hidden lg:flex items-center border rounded-full px-1 py-1 gap-0 transition-all duration-300 ${
            atTop ? "border-white/20" : "border-border"
          }`}
        >

          {/* Über mich dropdown */}
          <div className="relative group">
            <span
              className="text-xs px-4 py-1.5 rounded-full hover:bg-surface transition-colors whitespace-nowrap flex items-center gap-1 cursor-default"
              style={{
                fontFamily: "var(--font-sans)",
                color: atTop ? CREAM : "var(--color-muted)",
              }}
            >
              {locale === "de" ? "Über mich" : "About me"}
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
                {locale === "de" ? "Zu meiner Person" : "About me"}
              </Link>
              <Link
                href={`/${locale}/impressum`}
                className="block px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Impressum" : "Legal Notice"}
              </Link>
            </div>
          </div>

          <span className={`w-px h-3 shrink-0 transition-colors duration-300 ${atTop ? "bg-white/20" : "bg-border"}`} />

          {/* Themen dropdown */}
          <div className="relative group">
            <span
              className="text-xs px-4 py-1.5 rounded-full hover:bg-surface transition-colors whitespace-nowrap flex items-center gap-1 cursor-default"
              style={{
                fontFamily: "var(--font-sans)",
                color: atTop ? CREAM : "var(--color-muted)",
              }}
            >
              {locale === "de" ? "Themen" : "Topics"}
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="opacity-50">
                <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="absolute top-[calc(100%+6px)] left-0 hidden group-hover:block bg-background border border-border rounded-lg shadow-lg py-1 min-w-[170px] z-50">
              {(themen[locale] ?? themen.de).map((t) => (
                <Link
                  key={t.slug}
                  href={`/${locale}/kategorien/${t.slug}`}
                  className="block px-4 py-2 text-xs text-muted hover:text-foreground hover:bg-surface transition-colors"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {locale === "de" ? t.de : t.en}
                </Link>
              ))}
            </div>
          </div>

          <span className={`w-px h-3 shrink-0 transition-colors duration-300 ${atTop ? "bg-white/20" : "bg-border"}`} />

          {/* Projekte */}
          <Link
            href={`/${locale}/projekte`}
            className="text-xs px-4 py-1.5 rounded-full hover:bg-surface transition-colors whitespace-nowrap"
            style={{
              fontFamily: "var(--font-sans)",
              color: atTop ? CREAM : "var(--color-muted)",
            }}
          >
            {locale === "de" ? "Projekte" : "Projects"}
          </Link>

          <span className={`w-px h-3 shrink-0 transition-colors duration-300 ${atTop ? "bg-white/20" : "bg-border"}`} />

          {/* Ressourcen */}
          <Link
            href={`/${locale}/ressourcen`}
            className="text-xs px-4 py-1.5 rounded-full hover:bg-surface transition-colors whitespace-nowrap"
            style={{
              fontFamily: "var(--font-sans)",
              color: atTop ? CREAM : "var(--color-muted)",
            }}
          >
            {locale === "de" ? "Ressourcen" : "Resources"}
          </Link>

        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${locale}/kontakt`}
            className="hidden md:inline-flex items-center text-xs px-4 py-1.5 rounded-full border transition-colors"
            style={{
              fontFamily: "var(--font-sans)",
              borderColor: atTop ? "rgba(237,229,216,0.5)" : "var(--color-accent)",
              color: atTop ? CREAM : "var(--color-accent)",
            }}
          >
            {locale === "de" ? "Kontakt" : "Contact"}
          </Link>
          <DarkModeToggle />
          <LanguageToggle />
          {/* Admin-Zugang */}
          <Link
            href="/admin"
            className="transition-colors opacity-40 hover:opacity-100"
            aria-label="Admin"
            title="Admin"
            style={{ color: atTop ? CREAM_MUTED : "var(--color-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </Link>
          {/* Hamburger button — mobile only */}
          <button
            className="lg:hidden flex items-center justify-center w-8 h-8 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Menu schließen" : "Menu öffnen"}
            aria-expanded={mobileOpen}
            style={{ color: atTop ? CREAM : "var(--color-muted)" }}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="16" y2="16" />
                <line x1="16" y1="2" x2="2" y2="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="4" x2="16" y2="4" />
                <line x1="2" y1="9" x2="16" y2="9" />
                <line x1="2" y1="14" x2="16" y2="14" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile menu — always solid */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-40 px-6 py-5 space-y-5"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {/* Themen */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              {locale === "de" ? "Themen" : "Topics"}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {(themen[locale] ?? themen.de).map((t) => (
                <Link
                  key={t.slug}
                  href={`/${locale}/kategorien/${t.slug}`}
                  className="px-3 py-2 text-sm text-foreground hover:bg-surface rounded transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {locale === "de" ? t.de : t.en}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Navigation */}
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/${locale}/blog`}
              className="px-3 py-2 text-sm text-foreground hover:bg-surface rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {locale === "de" ? "Alle Artikel" : "All Articles"}
            </Link>
            <Link
              href={`/${locale}/projekte`}
              className="px-3 py-2 text-sm text-foreground hover:bg-surface rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {locale === "de" ? "Projekte" : "Projects"}
            </Link>
            <Link
              href={`/${locale}/ressourcen`}
              className="px-3 py-2 text-sm text-foreground hover:bg-surface rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {locale === "de" ? "Ressourcen" : "Resources"}
            </Link>
            <Link
              href={`/${locale}/zu-meiner-person`}
              className="px-3 py-2 text-sm text-foreground hover:bg-surface rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {locale === "de" ? "Über mich" : "About me"}
            </Link>
            <Link
              href={`/${locale}/kontakt`}
              className="px-3 py-2 text-sm text-accent font-medium hover:bg-surface rounded transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {locale === "de" ? "Kontakt" : "Contact"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
