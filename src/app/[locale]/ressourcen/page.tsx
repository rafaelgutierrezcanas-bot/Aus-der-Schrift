export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const sections = locale === "de"
    ? [
        {
          title: "Bücher",
          description: "Empfehlenswerte theologische Literatur — von Bibelkommentaren bis zu klassischen Werken der Kirchengeschichte.",
          items: [],
        },
        {
          title: "Artikel",
          description: "Ausgewählte Artikel und Essays aus zuverlässigen theologischen Quellen.",
          items: [],
        },
        {
          title: "Podcast",
          description: "Hörenswerte Podcasts zu Theologie, Bibelauslegung und christlichem Leben.",
          items: [],
        },
      ]
    : [
        {
          title: "Books",
          description: "Recommended theological literature — from Bible commentaries to classic works of church history.",
          items: [],
        },
        {
          title: "Articles",
          description: "Selected articles and essays from reliable theological sources.",
          items: [],
        },
        {
          title: "Podcast",
          description: "Podcasts worth listening to on theology, biblical interpretation, and Christian life.",
          items: [],
        },
      ];

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Weiterführendes" : "Further Reading"}
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Ressourcen
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Hier findest du eine Auswahl empfehlenswerter Bücher, Artikel und Podcasts zu Bibel, Theologie und Kirchengeschichte."
          : "Here you will find a selection of recommended books, articles and podcasts on the Bible, theology and church history."}
      </p>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.title}>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {section.title}
            </h2>
            <p
              className="text-muted text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-body-serif)" }}
            >
              {section.description}
            </p>
            <p
              className="text-muted/50 text-xs mt-4 italic"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Bald verfügbar." : "Coming soon."}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
