import type { Metadata } from "next";
import Link from "next/link";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/datenschutz",
    deTitle: "Datenschutzerklärung",
    enTitle: "Privacy Policy",
    deDescription: "Informationen zum Datenschutz auf Theologik.",
    enDescription: "Privacy information for Theologik.",
  });
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDE = locale === "de";

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="mb-10">
      <h2
        className="text-base font-semibold uppercase tracking-widest text-accent mb-3"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-[0.9375rem] leading-relaxed text-muted">{children}</div>
    </section>
  );

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDE ? "Datenschutzerklärung" : "Privacy Policy"}
      </h1>
      <p
        className="text-sm text-muted mb-12"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {isDE ? "Stand: August 2026" : "Last updated: August 2026"}
      </p>

      <div style={{ fontFamily: "var(--font-body-serif)" }}>
        {/* 1. Verantwortlicher */}
        <Section title={isDE ? "1. Verantwortlicher" : "1. Data Controller"}>
          <p>
            Rafael Gutiérrez-Canas Pazos
            <br />
            Hudemühler Straße 123
            <br />
            28329 Bremen
          </p>
          <p>
            E-Mail:{" "}
            <a href="mailto:info@theologik.org" className="text-accent hover:underline">
              info@theologik.org
            </a>
          </p>
        </Section>

        {/* 2. Allgemeines */}
        <Section title={isDE ? "2. Allgemeines zur Datenverarbeitung" : "2. General Information"}>
          <p>
            {isDE
              ? "Der Schutz deiner persönlichen Daten ist mir wichtig. Diese Datenschutzerklärung informiert dich darüber, welche Daten bei der Nutzung dieser Website erhoben werden, zu welchem Zweck dies geschieht und auf welcher Rechtsgrundlage die Verarbeitung erfolgt."
              : "The protection of your personal data is important to me. This privacy policy informs you about what data is collected when using this website, for what purpose and on what legal basis."}
          </p>
          <p>
            {isDE
              ? "Rechtsgrundlagen der Verarbeitung sind Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)."
              : "The legal bases for processing are Art. 6(1)(a) GDPR (consent), Art. 6(1)(b) GDPR (contract performance) and Art. 6(1)(f) GDPR (legitimate interest)."}
          </p>
        </Section>

        {/* 3. Hosting */}
        <Section title={isDE ? "3. Hosting" : "3. Hosting"}>
          <p>
            {isDE
              ? "Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Beim Aufruf der Seite werden automatisch Verbindungsdaten (IP-Adresse, Zeitpunkt, Browser-Typ, angefragte URL) an die Server von Vercel übermittelt. Dies ist technisch notwendig, um die Website auszuliefern."
              : "This website is hosted by Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA). When you access the site, connection data (IP address, timestamp, browser type, requested URL) is automatically transmitted to Vercel's servers. This is technically necessary to deliver the website."}
          </p>
          <p>
            {isDE
              ? "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung der Website). Vercel verarbeitet Daten unter dem EU-US Data Privacy Framework."
              : "Legal basis: Art. 6(1)(f) GDPR (legitimate interest in providing the website). Vercel processes data under the EU-US Data Privacy Framework."}
          </p>
        </Section>

        {/* 4. Webanalyse */}
        <Section title={isDE ? "4. Webanalyse" : "4. Web Analytics"}>
          <p>
            {isDE
              ? "Diese Website nutzt Vercel Analytics, einen datenschutzfreundlichen Analysedienst. Vercel Analytics verwendet keine Cookies, speichert keine IP-Adressen und erfasst keine personenbezogenen Daten. Es werden ausschließlich anonymisierte Nutzungsdaten erhoben (Seitenaufrufe, Verweisdauer, Referrer, Land)."
              : "This website uses Vercel Analytics, a privacy-friendly analytics service. Vercel Analytics does not use cookies, does not store IP addresses and does not collect personal data. Only anonymized usage data is collected (page views, duration, referrer, country)."}
          </p>
          <p>
            {isDE
              ? "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung des Webangebots). Ein Cookie-Banner ist nicht erforderlich, da keine Cookies gesetzt und keine personenbezogenen Daten verarbeitet werden."
              : "Legal basis: Art. 6(1)(f) GDPR (legitimate interest in improving the website). A cookie banner is not required as no cookies are set and no personal data is processed."}
          </p>
        </Section>

        {/* 5. Content Management */}
        <Section title={isDE ? "5. Content-Management-System" : "5. Content Management System"}>
          <p>
            {isDE
              ? "Inhalte dieser Website werden über Sanity.io (Sanity AS, Grünerløkka, Oslo, Norwegen) verwaltet. Bilder werden über das CDN von Sanity (cdn.sanity.io) ausgeliefert. Beim Laden von Bildern wird deine IP-Adresse an das Sanity-CDN übermittelt."
              : "Content on this website is managed via Sanity.io (Sanity AS, Grünerløkka, Oslo, Norway). Images are served through Sanity's CDN (cdn.sanity.io). When loading images, your IP address is transmitted to Sanity's CDN."}
          </p>
          <p>
            {isDE
              ? "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der effizienten Bereitstellung von Inhalten)."
              : "Legal basis: Art. 6(1)(f) GDPR (legitimate interest in efficient content delivery)."}
          </p>
        </Section>

        {/* 6. Schriftarten */}
        <Section title={isDE ? "6. Schriftarten (Google Fonts)" : "6. Fonts (Google Fonts)"}>
          <p>
            {isDE
              ? "Diese Website verwendet Schriftarten von Google (Playfair Display, Source Serif 4, Inter). Die Schriften werden über Next.js Font Optimization lokal eingebunden und nicht zur Laufzeit von Google-Servern nachgeladen. Es findet daher keine Datenübermittlung an Google statt."
              : "This website uses fonts from Google (Playfair Display, Source Serif 4, Inter). The fonts are embedded locally via Next.js Font Optimization and are not loaded from Google servers at runtime. No data is transmitted to Google."}
          </p>
        </Section>

        {/* 7. Kommentare */}
        <Section title={isDE ? "7. Kommentarfunktion" : "7. Comments"}>
          <p>
            {isDE
              ? "Du kannst auf dieser Website Kommentare zu Artikeln hinterlassen. Dabei werden folgende Daten erhoben:"
              : "You can leave comments on articles on this website. The following data is collected:"}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{isDE ? "Name (Pflichtfeld)" : "Name (required)"}</li>
            <li>{isDE ? "E-Mail-Adresse (freiwillig)" : "Email address (optional)"}</li>
            <li>{isDE ? "Kommentartext (Pflichtfeld)" : "Comment text (required)"}</li>
          </ul>
          <p>
            {isDE
              ? "Kommentare werden in Sanity.io gespeichert und vor der Veröffentlichung moderiert. Deine IP-Adresse wird ausschließlich temporär zur Missbrauchsprävention (Rate-Limiting) verwendet und nicht dauerhaft gespeichert."
              : "Comments are stored in Sanity.io and moderated before publication. Your IP address is only used temporarily for abuse prevention (rate limiting) and is not stored permanently."}
          </p>
          <p>
            {isDE
              ? "Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch Absenden des Kommentars). Du kannst die Löschung deines Kommentars jederzeit per E-Mail an info@theologik.org verlangen."
              : "Legal basis: Art. 6(1)(a) GDPR (consent by submitting the comment). You can request deletion of your comment at any time by emailing info@theologik.org."}
          </p>
        </Section>

        {/* 8. Kontaktformular */}
        <Section title={isDE ? "8. Kontaktformular" : "8. Contact Form"}>
          <p>
            {isDE
              ? "Das Kontaktformular öffnet dein E-Mail-Programm (mailto-Link). Die eingegebenen Daten werden nicht auf dem Server gespeichert, sondern direkt über dein E-Mail-Programm versendet."
              : "The contact form opens your email client (mailto link). The entered data is not stored on the server but sent directly via your email client."}
          </p>
        </Section>

        {/* 9. Lokale Speicherung */}
        <Section title={isDE ? "9. Lokale Speicherung (localStorage)" : "9. Local Storage"}>
          <p>
            {isDE
              ? "Diese Website speichert folgende Daten lokal in deinem Browser (localStorage):"
              : "This website stores the following data locally in your browser (localStorage):"}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {isDE
                ? "Schriftgröße-Einstellung (für die Lesbarkeit)"
                : "Font size setting (for readability)"}
            </li>
            <li>
              {isDE
                ? "Lernfortschritt im Hermeneutik-Bereich"
                : "Learning progress in the hermeneutics section"}
            </li>
          </ul>
          <p>
            {isDE
              ? "Diese Daten verlassen deinen Browser nicht und werden nicht an einen Server übermittelt. Du kannst sie jederzeit über die Browser-Einstellungen löschen."
              : "This data does not leave your browser and is not transmitted to any server. You can delete it at any time via your browser settings."}
          </p>
        </Section>

        {/* 10. Deine Rechte */}
        <Section title={isDE ? "10. Deine Rechte" : "10. Your Rights"}>
          <p>
            {isDE
              ? "Du hast nach der DSGVO folgende Rechte bezüglich deiner personenbezogenen Daten:"
              : "Under the GDPR, you have the following rights regarding your personal data:"}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              {isDE
                ? "Recht auf Auskunft (Art. 15 DSGVO)"
                : "Right of access (Art. 15 GDPR)"}
            </li>
            <li>
              {isDE
                ? "Recht auf Berichtigung (Art. 16 DSGVO)"
                : "Right to rectification (Art. 16 GDPR)"}
            </li>
            <li>
              {isDE
                ? "Recht auf Löschung (Art. 17 DSGVO)"
                : "Right to erasure (Art. 17 GDPR)"}
            </li>
            <li>
              {isDE
                ? "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)"
                : "Right to restriction of processing (Art. 18 GDPR)"}
            </li>
            <li>
              {isDE
                ? "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)"
                : "Right to data portability (Art. 20 GDPR)"}
            </li>
            <li>
              {isDE
                ? "Widerspruchsrecht (Art. 21 DSGVO)"
                : "Right to object (Art. 21 GDPR)"}
            </li>
          </ul>
          <p>
            {isDE
              ? "Zur Ausübung deiner Rechte wende dich bitte per E-Mail an info@theologik.org."
              : "To exercise your rights, please contact info@theologik.org."}
          </p>
        </Section>

        {/* 11. Beschwerderecht */}
        <Section
          title={
            isDE
              ? "11. Beschwerderecht bei einer Aufsichtsbehörde"
              : "11. Right to Lodge a Complaint"
          }
        >
          <p>
            {isDE
              ? "Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die für mich zuständige Aufsichtsbehörde ist:"
              : "You have the right to lodge a complaint with a data protection supervisory authority. The authority responsible for me is:"}
          </p>
          <p>
            Die Landesbeauftragte für Datenschutz und Informationsfreiheit der Freien Hansestadt Bremen
            <br />
            Arndtstraße 1, 27570 Bremerhaven
            <br />
            <a
              href="https://www.datenschutz.bremen.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              www.datenschutz.bremen.de
            </a>
          </p>
        </Section>

        {/* 12. Änderungen */}
        <Section title={isDE ? "12. Änderungen" : "12. Changes"}>
          <p>
            {isDE
              ? "Ich behalte mir vor, diese Datenschutzerklärung bei Bedarf anzupassen, z.B. bei Änderungen der Website oder gesetzlicher Vorgaben. Die aktuelle Version findest du stets auf dieser Seite."
              : "I reserve the right to update this privacy policy as needed, e.g. when changes are made to the website or legal requirements. The current version is always available on this page."}
          </p>
        </Section>

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            href={`/${locale}/impressum`}
            className="text-sm text-accent hover:underline"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {isDE ? "→ Impressum" : "→ Legal Notice"}
          </Link>
        </div>
      </div>
    </div>
  );
}
