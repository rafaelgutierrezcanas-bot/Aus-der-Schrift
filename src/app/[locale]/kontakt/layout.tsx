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
    pathname: "/kontakt",
    deTitle: "Kontakt",
    enTitle: "Contact",
    deDescription: "Kontaktiere Theologik für Fragen, Rückmeldungen oder thematische Anregungen.",
    enDescription: "Contact Theologik for questions, feedback, or topic suggestions.",
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
