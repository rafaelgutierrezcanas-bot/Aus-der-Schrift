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
    pathname: "/zu-meiner-person",
    deTitle: "Zu meiner Person",
    enTitle: "About the Author",
    deDescription:
      "Mehr über die Person hinter Theologik und die inhaltliche Ausrichtung des theologischen Blogs.",
    enDescription:
      "Learn more about the person behind Theologik and the editorial direction of the theological blog.",
  });
}

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
