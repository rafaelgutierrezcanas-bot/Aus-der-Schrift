import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Playfair_Display, Source_Serif_4, Inter } from "next/font/google";
import { absoluteUrl, SITE_NAME, SITE_TITLE } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-body-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  applicationName: SITE_NAME,
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  description: "Theologik – Theologie, Bibelauslegung, Kirchengeschichte und geistliches Leben aus der Heiligen Schrift.",
  keywords: [
    "Theologik",
    "Theologie Blog",
    "christlicher Blog",
    "Bibelauslegung",
    "Kirchengeschichte",
    "Apologetik",
    "geistliches Leben",
    "theologische Artikel",
  ],
  authors: [{ name: SITE_NAME, url: absoluteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/de",
    languages: {
      de: "/de",
      en: "/en",
      "x-default": "/de",
    },
  },
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: "Theologik – Theologie, Bibelauslegung, Kirchengeschichte und geistliches Leben aus der Heiligen Schrift.",
    url: absoluteUrl("/de"),
    siteName: SITE_NAME,
    locale: "de_DE",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "Theologik – Theologie, Bibelauslegung, Kirchengeschichte und geistliches Leben aus der Heiligen Schrift.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "de";

  return (
    <html lang={locale} suppressHydrationWarning className={`${playfair.variable} ${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
