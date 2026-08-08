import { client } from "@/sanity/client";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";

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
      <form
        action={`mailto:info@theologik.org`}
        method="get"
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Name" : "Name"} *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "E-Mail-Adresse" : "Email address"} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Betreff" : "Subject"} *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Nachricht" : "Message"} *
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            required
            className="w-full px-4 py-2.5 border border-border rounded-sm bg-surface/40 text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors text-xs"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Nachricht senden" : "Send message"}
        </button>
      </form>
    </div>
  );
}
