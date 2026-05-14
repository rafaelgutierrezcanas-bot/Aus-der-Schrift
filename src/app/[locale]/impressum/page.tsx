export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1
        className="text-3xl font-bold mb-10"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Impressum
      </h1>
      <div
        className="space-y-8 text-[1.0625rem] leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        <section>
          <h2
            className="text-base font-semibold uppercase tracking-widest text-accent mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Angaben gemäß § 5 TMG" : "Information pursuant to § 5 TMG"}
          </h2>
          <p>Rafael Gutiérrez-Canas Pazos</p>
          <p className="text-muted">Hudemühler Straße 123</p>
          <p className="text-muted">28329 Bremen</p>
        </section>

        <section>
          <h2
            className="text-base font-semibold uppercase tracking-widest text-accent mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Kontakt" : "Contact"}
          </h2>
          <p>
            E-Mail:{" "}
            <a
              href="mailto:info@theologik.org"
              className="text-accent hover:underline"
            >
              info@theologik.org
            </a>
          </p>
        </section>

        <section>
          <h2
            className="text-base font-semibold uppercase tracking-widest text-accent mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Inhaltlich verantwortlich" : "Responsible for content"}
          </h2>
          <p className="text-muted">
            {locale === "de"
              ? "Rafael Gutiérrez-Canas Pazos (Adresse wie oben)"
              : "Rafael Gutiérrez-Canas Pazos (address as above)"}
          </p>
        </section>

        <section>
          <h2
            className="text-base font-semibold uppercase tracking-widest text-accent mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Haftungsausschluss" : "Disclaimer"}
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            {locale === "de"
              ? "Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden."
              : "The contents of this website have been created with the greatest possible care. However, no guarantee can be accepted for the accuracy, completeness or topicality of the content."}
          </p>
        </section>
      </div>
    </div>
  );
}
