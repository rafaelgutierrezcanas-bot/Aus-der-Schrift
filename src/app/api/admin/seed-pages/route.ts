import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

const pages = [
  {
    _type: "page",
    _id: "page-zu-meiner-person",
    slug: { _type: "slug", current: "zu-meiner-person" },
    titleDe: "Herzlich willkommen bei Theologik!",
    titleEn: "Welcome to Theologik!",
    bodyDe: [
      {
        _type: "block",
        _key: "zmp-de-1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Ich bin Rafael \u2014 und auf diesem Blog teile ich, was mich an Bibel, Theologie und Kirchengeschichte fasziniert. Je l\u00e4nger ich mich damit besch\u00e4ftige, desto mehr zieht es mich in die Tiefe dieser Themen.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-de-2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s2",
            text: "Mir liegt daran, einen Glauben zu f\u00f6rdern, der akademisch tragf\u00e4hig ist und zugleich von einer tiefen Hingabe an den Herrn Jesus lebt. Beides schlie\u00dft sich nicht aus, sondern bedingt einander. Viele Fragen rund um Bibel und Theologie sind dabei vielschichtiger, als es zun\u00e4chst scheint. Diese Komplexit\u00e4t ernst zu nehmen, statt sie zu \u00fcbergehen, halte ich f\u00fcr entscheidend \u2014 nicht nur f\u00fcr ein redliches Verst\u00e4ndnis der Sache, sondern auch f\u00fcr eine Gespr\u00e4chskultur, die dem Gegen\u00fcber mit Demut und Respekt begegnet.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-de-3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s3",
            text: "Mein Ziel ist es deshalb, gut recherchierte und verst\u00e4ndliche Beitr\u00e4ge zu Bibel, Theologie und christlicher Praxis anzubieten, die Leser dabei unterst\u00fctzen, ihren Glauben informiert und alltagstauglich zu leben.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-de-4",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "Schau dich gerne um und lies dir die Artikel durch, die dich interessieren. Gottes Segen dir dabei!",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-de-5",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s5",
            text: "Soli Deo Gloria.",
            marks: ["em"],
          },
        ],
        markDefs: [],
      },
    ],
    bodyEn: [
      {
        _type: "block",
        _key: "zmp-en-1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "I\u2019m Rafael \u2014 and on this blog I share what fascinates me about the Bible, theology, and church history. What started as a personal research project has become a real passion.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-en-2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s2",
            text: "My goal is to provide well-researched, understandable articles on the Bible, theology, and Christian practice \u2014 to help readers live out their faith in an informed and practical way.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-en-3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s3",
            text: "Feel free to browse and read the articles that interest you. God bless you as you do!",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "zmp-en-4",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "Soli Deo Gloria.",
            marks: ["em"],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _type: "page",
    _id: "page-uber-uns",
    slug: { _type: "slug", current: "uber-uns" },
    titleDe: "\u00dcber Theologik",
    titleEn: "About Theologik",
    bodyDe: [
      {
        _type: "block",
        _key: "uu-de-1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Theologik",
            marks: ["em"],
          },
          {
            _type: "span",
            _key: "s2",
            text: " ist ein theologischer Blog, der fundierte Artikel zu Bibelauslegung, Kirchengeschichte, Apologetik und geistlichem Leben ver\u00f6ffentlicht.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "uu-de-2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s3",
            text: "Unser Ziel ist es, akademische Theologie zug\u00e4nglich zu machen \u2014 ohne dabei an Tiefe zu verlieren.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "uu-de-3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "Soli Deo Gloria.",
            marks: ["em"],
          },
        ],
        markDefs: [],
      },
    ],
    bodyEn: [
      {
        _type: "block",
        _key: "uu-en-1",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Theologik",
            marks: ["em"],
          },
          {
            _type: "span",
            _key: "s2",
            text: " is a theological blog publishing well-researched articles on Bible interpretation, church history, apologetics, and spiritual life.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "uu-en-2",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s3",
            text: "Our goal is to make academic theology accessible \u2014 without sacrificing depth.",
            marks: [],
          },
        ],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "uu-en-3",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s4",
            text: "Soli Deo Gloria.",
            marks: ["em"],
          },
        ],
        markDefs: [],
      },
    ],
  },
  {
    _type: "page",
    _id: "page-impressum",
    slug: { _type: "slug", current: "impressum" },
    titleDe: "Impressum",
    titleEn: "Legal Notice",
    bodyDe: [
      {
        _type: "block",
        _key: "imp-de-1",
        style: "h2",
        children: [{ _type: "span", _key: "s1", text: "Angaben gem\u00e4\u00df \u00a7 5 TMG", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-2",
        style: "normal",
        children: [{ _type: "span", _key: "s2", text: "Rafael Guti\u00e9rrez-Canas Pazos\nHudem\u00fchler Stra\u00dfe 123\n28329 Bremen", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-3",
        style: "h2",
        children: [{ _type: "span", _key: "s3", text: "Kontakt", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-4",
        style: "normal",
        children: [{ _type: "span", _key: "s4", text: "E-Mail: info@theologik.org", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-5",
        style: "h2",
        children: [{ _type: "span", _key: "s5", text: "Inhaltlich verantwortlich", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-6",
        style: "normal",
        children: [{ _type: "span", _key: "s6", text: "Rafael Guti\u00e9rrez-Canas Pazos (Adresse wie oben)", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-7",
        style: "h2",
        children: [{ _type: "span", _key: "s7", text: "Haftungsausschluss", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-de-8",
        style: "normal",
        children: [{ _type: "span", _key: "s8", text: "Die Inhalte dieser Website wurden mit gr\u00f6\u00dftm\u00f6glicher Sorgfalt erstellt. F\u00fcr die Richtigkeit, Vollst\u00e4ndigkeit und Aktualit\u00e4t der Inhalte kann jedoch keine Gew\u00e4hr \u00fcbernommen werden.", marks: [] }],
        markDefs: [],
      },
    ],
    bodyEn: [
      {
        _type: "block",
        _key: "imp-en-1",
        style: "h2",
        children: [{ _type: "span", _key: "s1", text: "Information pursuant to \u00a7 5 TMG", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-2",
        style: "normal",
        children: [{ _type: "span", _key: "s2", text: "Rafael Guti\u00e9rrez-Canas Pazos\nHudem\u00fchler Stra\u00dfe 123\n28329 Bremen", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-3",
        style: "h2",
        children: [{ _type: "span", _key: "s3", text: "Contact", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-4",
        style: "normal",
        children: [{ _type: "span", _key: "s4", text: "Email: info@theologik.org", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-5",
        style: "h2",
        children: [{ _type: "span", _key: "s5", text: "Responsible for content", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-6",
        style: "normal",
        children: [{ _type: "span", _key: "s6", text: "Rafael Guti\u00e9rrez-Canas Pazos (address as above)", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-7",
        style: "h2",
        children: [{ _type: "span", _key: "s7", text: "Disclaimer", marks: [] }],
        markDefs: [],
      },
      {
        _type: "block",
        _key: "imp-en-8",
        style: "normal",
        children: [{ _type: "span", _key: "s8", text: "The contents of this website have been created with the greatest possible care. However, no guarantee can be accepted for the accuracy, completeness or topicality of the content.", marks: [] }],
        markDefs: [],
      },
    ],
  },
  {
    _type: "page",
    _id: "page-kontakt",
    slug: { _type: "slug", current: "kontakt" },
    titleDe: "Kontakt",
    titleEn: "Contact",
    bodyDe: [
      {
        _type: "block",
        _key: "kon-de-1",
        style: "normal",
        children: [{ _type: "span", _key: "s1", text: "Du kannst mich auch direkt per E-Mail erreichen. Ich antworte in der Regel innerhalb von 24\u201348 Stunden.", marks: [] }],
        markDefs: [],
      },
    ],
    bodyEn: [
      {
        _type: "block",
        _key: "kon-en-1",
        style: "normal",
        children: [{ _type: "span", _key: "s1", text: "You can also reach me directly by email. I usually reply within 24\u201348 hours.", marks: [] }],
        markDefs: [],
      },
    ],
  },
];

export async function GET() {
  const results: string[] = [];

  for (const page of pages) {
    try {
      await writeClient.createIfNotExists(page);
      results.push(`\u2713 ${page.slug.current}`);
    } catch (err) {
      results.push(`\u2717 ${page.slug.current}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ results });
}
