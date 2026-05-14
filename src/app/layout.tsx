import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { absoluteUrl, SITE_NAME, SITE_TITLE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  applicationName: SITE_NAME,
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
