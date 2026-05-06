import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: "/uber-uns",
    deTitle: "Über Theologik",
    enTitle: "About Theologik",
    deDescription:
      "Erfahre mehr über Theologik, den theologischen Blog zu Bibelauslegung, Kirchengeschichte, Apologetik und geistlichem Leben.",
    enDescription:
      "Learn more about Theologik, the theological blog on biblical interpretation, church history, apologetics, and spiritual life.",
  });
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
