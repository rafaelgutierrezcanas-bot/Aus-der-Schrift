import { client } from "@/sanity/client";
import { hermeneutikTextBySlugQuery } from "@/sanity/queries";
import { notFound } from "next/navigation";
import { AnalysisWorkspace } from "@/components/hermeneutik/AnalysisWorkspace";
import type { HermeneutikTextFull } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function WerkbankAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const text: HermeneutikTextFull | null = await client.fetch(
    hermeneutikTextBySlugQuery,
    { slug }
  );

  if (!text) notFound();

  const sortedAnalyses = (text.stepAnalyses || [])
    .filter((sa) => sa.step)
    .sort((a, b) => a.step.order - b.step.order);

  return (
    <AnalysisWorkspace
      text={{ ...text, stepAnalyses: sortedAnalyses }}
      locale={locale}
    />
  );
}
