export default async function UnitPage({
  params,
}: {
  params: Promise<{ locale: string; unitSlug: string }>;
}) {
  const { unitSlug } = await params;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1>Debug: {unitSlug}</h1>
    </div>
  );
}
