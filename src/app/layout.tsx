import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Aus der Schrift", template: "%s | Aus der Schrift" },
  description: "Theologischer Blog über Bibelauslegung und Kirchengeschichte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
