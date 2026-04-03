import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} />
      <main className="min-h-screen">{children}</main>
      <footer className="mt-24 border-t border-border bg-background">
  <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

    {/* Col 1: Logo + tagline */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent">✦</span>
        <span
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Aus der Schrift
        </span>
      </div>
      <p
        className="text-sm text-muted leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        Fundierte Theologie aus der Heiligen Schrift.
      </p>
      <p
        className="mt-4 text-xs text-muted italic"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Soli Deo Gloria
      </p>
    </div>

    {/* Col 2: Kategorien */}
    <div>
      <p
        className="text-xs uppercase tracking-widest text-muted mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Kategorien
      </p>
      <ul className="space-y-2">
        {[
          { label: "Theologie", slug: "theologie" },
          { label: "Apologetik", slug: "apologetik" },
          { label: "Kirchengeschichte", slug: "kirchengeschichte" },
          { label: "Geistliches Leben", slug: "geistliches-leben" },
        ].map((cat) => (
          <li key={cat.slug}>
            <a
              href={`/${locale}/kategorien/${cat.slug}`}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {cat.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    {/* Col 3: Blog links */}
    <div>
      <p
        className="text-xs uppercase tracking-widest text-muted mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Blog
      </p>
      <ul className="space-y-2">
        {[
          { label: locale === "de" ? "Alle Artikel" : "All Articles", href: `/${locale}/blog` },
          { label: locale === "de" ? "Über uns" : "About", href: `/${locale}/uber-uns` },
        ].map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

  </div>

  {/* Bottom bar */}
  <div className="border-t border-border">
    <div
      className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-muted"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      © {new Date().getFullYear()} Aus der Schrift · Soli Deo Gloria
    </div>
  </div>
</footer>
    </NextIntlClientProvider>
  );
}
