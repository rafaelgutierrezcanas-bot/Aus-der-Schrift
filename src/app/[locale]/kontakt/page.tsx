import { client } from "@/sanity/client";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { ContactForm } from "@/components/ContactForm";

const pageQuery = `*[_type == "page" && slug.current == "kontakt"][0]{
  titleDe, titleEn, bodyDe, bodyEn
}`;

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await client.fetch(pageQuery);

  const title = locale === "de"
    ? (page?.titleDe ?? "Kontakt")
    : (page?.titleEn ?? "Contact");
  const subtitle = locale === "de"
    ? (page ? undefined : "Schreib mir")
    : (page ? undefined : "Get in touch");
  const body = locale === "de" ? page?.bodyDe : page?.bodyEn;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      {subtitle && (
        <p
          className="text-xs uppercase tracking-widest text-accent mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {subtitle}
        </p>
      )}
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h1>

      {body ? (
        <div
          className="mb-10"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          <PortableTextRenderer value={body} locale={locale} />
        </div>
      ) : (
        <p
          className="text-muted mb-10"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Du kannst mich auch direkt per E-Mail erreichen. Ich antworte in der Regel innerhalb von 24–48 Stunden."
            : "You can also reach me directly by email. I usually reply within 24–48 hours."}
        </p>
      )}

      {/* Contact form */}
      <ContactForm locale={locale} />
    </div>
  );
}
