import { client } from "@/sanity/client";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";

const pageQuery = `*[_type == "page" && slug.current == "uber-uns"][0]{
  titleDe, titleEn, bodyDe, bodyEn
}`;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await client.fetch(pageQuery);

  const title = locale === "de"
    ? (page?.titleDe ?? "Über Theologik")
    : (page?.titleEn ?? "About Theologik");
  const body = locale === "de" ? page?.bodyDe : page?.bodyEn;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h1>
      <div className="space-y-5 text-[1.0625rem] leading-relaxed" style={{ fontFamily: "var(--font-body-serif)" }}>
        {body ? (
          <PortableTextRenderer value={body} locale={locale} />
        ) : locale === "de" ? (
          <>
            <p>
              <em>Theologik</em> ist ein theologischer Blog, der fundierte Artikel zu
              Bibelauslegung, Kirchengeschichte, Apologetik und geistlichem Leben veröffentlicht.
            </p>
            <p>
              Unser Ziel ist es, akademische Theologie zugänglich zu machen — ohne dabei an
              Tiefe zu verlieren.
            </p>
            <p className="text-muted italic">Soli Deo Gloria.</p>
          </>
        ) : (
          <>
            <p>
              <em>Theologik</em> is a theological blog publishing
              well-researched articles on Bible interpretation, church history, apologetics,
              and spiritual life.
            </p>
            <p>
              Our goal is to make academic theology accessible — without sacrificing depth.
            </p>
            <p className="text-muted italic">Soli Deo Gloria.</p>
          </>
        )}
      </div>
    </div>
  );
}
