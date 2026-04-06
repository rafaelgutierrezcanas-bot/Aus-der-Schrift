import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { TheologikLogo } from "@/components/TheologikLogo";

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
      <footer className="border-t border-border">
  {/* Main footer */}
  <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

    {/* Col 1: Brand + mission */}
    <div>
      <div className="mb-4">
        <TheologikLogo className="h-6 w-auto text-foreground" />
      </div>
      <p className="text-sm text-muted leading-relaxed mb-4" style={{ fontFamily: "var(--font-body-serif)" }}>
        {locale === "de"
          ? "Fundierte Theologie, Bibelauslegung und Kirchengeschichte — aus der Heiligen Schrift."
          : "Well-researched theology, biblical exegesis and church history — from Holy Scripture."}
      </p>
      <p className="text-xs text-muted/60 italic" style={{ fontFamily: "var(--font-sans)" }}>
        Soli Deo Gloria
      </p>
    </div>

    {/* Col 2: Themen */}
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-5" style={{ fontFamily: "var(--font-sans)" }}>
        {locale === "de" ? "Themen" : "Topics"}
      </p>
      <ul className="space-y-3">
        {[
          { de: "Theologie", en: "Theology", slug: "theologie" },
          { de: "Bibelauslegung", en: "Bible Interpretation", slug: "bibelauslegung" },
          { de: "Apologetik", en: "Apologetics", slug: "apologetik" },
          { de: "Kirchengeschichte", en: "Church History", slug: "kirchengeschichte" },
          { de: "Geistliches Leben", en: "Spiritual Life", slug: "geistliches-leben" },
        ].map((cat) => (
          <li key={cat.slug}>
            <a
              href={`/${locale}/kategorien/${cat.slug}`}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? cat.de : cat.en}
            </a>
          </li>
        ))}
      </ul>
    </div>

    {/* Col 3: Navigation */}
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-5" style={{ fontFamily: "var(--font-sans)" }}>
        Navigation
      </p>
      <ul className="space-y-3">
        {[
          { label: locale === "de" ? "Startseite" : "Home", href: `/${locale}` },
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

  {/* Colophon bottom bar */}
  <div className="border-t border-border">
    <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
      <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
        © {new Date().getFullYear()} Theologik
      </p>
      <p className="text-[11px] text-muted/70 italic" style={{ fontFamily: "var(--font-body-serif)" }}>
        {locale === "de"
          ? "\u201eDein Wort ist meines Fu\u00dfes Leuchte und ein Licht auf meinem Wege.\u201c \u2014 Ps 119,105"
          : "\u201cYour word is a lamp to my feet and a light to my path.\u201d \u2014 Ps 119:105"}
      </p>
    </div>
  </div>
</footer>
    </NextIntlClientProvider>
  );
}
