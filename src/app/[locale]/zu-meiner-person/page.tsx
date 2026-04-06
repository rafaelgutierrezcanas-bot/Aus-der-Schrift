export default async function ZuMeinerPersonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Über mich" : "About me"}
      </p>
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {locale === "de"
          ? <>Herzlich willkommen bei <em>Theologik</em>!</>
          : <>Welcome to <em>Theologik</em>!</>}
      </h1>
      <div
        className="space-y-5 text-[1.0625rem] leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de" ? (
          <>
            <p>
              Ich bin Rafael — und auf diesem Blog teile ich, was mich an Bibel,
              Theologie und Kirchengeschichte fasziniert. Was als persönliches
              Rechercheprojekt begann, ist für mich zu einer echten Leidenschaft
              geworden.
            </p>
            <p>
              Mein Ziel ist es, gut recherchierte und verständliche Beiträge zu
              Bibel, Theologie und christlicher Praxis anzubieten — um Leser
              dabei zu unterstützen, ihren Glauben informiert und alltagstauglich
              zu leben.
            </p>
            <p>
              Schau dich gerne um und lies dir die Artikel durch, die dich
              interessieren. Gottes Segen dir dabei!
            </p>
            <p className="text-muted italic text-sm pt-2">Soli Deo Gloria.</p>
          </>
        ) : (
          <>
            <p>
              I'm Rafael — and on this blog I share what fascinates me about the
              Bible, theology, and church history. What started as a personal
              research project has become a real passion.
            </p>
            <p>
              My goal is to provide well-researched, understandable articles on
              the Bible, theology, and Christian practice — to help readers live
              out their faith in an informed and practical way.
            </p>
            <p>
              Feel free to browse and read the articles that interest you. God
              bless you as you do!
            </p>
            <p className="text-muted italic text-sm pt-2">Soli Deo Gloria.</p>
          </>
        )}
      </div>
    </div>
  );
}
