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
      <footer className="mt-24 py-8 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-muted" style={{ fontFamily: "var(--font-sans)" }}>
          <p>Soli Deo Gloria · Aus der Schrift</p>
        </div>
      </footer>
    </NextIntlClientProvider>
  );
}
