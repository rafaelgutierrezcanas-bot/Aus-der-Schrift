export interface BibleRef {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  key: string;
  raw: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Map of German book names/abbreviations → normalized code.
 * Codes follow the pattern: "Gen", "Ex", "Lev", ..., "Offb"
 */
const BOOK_MAP: Record<string, string> = {
  // Pentateuch
  "1. mose": "1Mo", "1 mose": "1Mo", "1.mose": "1Mo", "genesis": "1Mo", "gen": "1Mo", "1 mo": "1Mo", "1.mo": "1Mo", "1mo": "1Mo",
  "2. mose": "2Mo", "2 mose": "2Mo", "2.mose": "2Mo", "exodus": "2Mo", "ex": "2Mo", "2 mo": "2Mo", "2.mo": "2Mo", "2mo": "2Mo",
  "3. mose": "3Mo", "3 mose": "3Mo", "3.mose": "3Mo", "levitikus": "3Mo", "lev": "3Mo", "3 mo": "3Mo", "3.mo": "3Mo", "3mo": "3Mo",
  "4. mose": "4Mo", "4 mose": "4Mo", "4.mose": "4Mo", "numeri": "4Mo", "num": "4Mo", "4 mo": "4Mo", "4.mo": "4Mo", "4mo": "4Mo",
  "5. mose": "5Mo", "5 mose": "5Mo", "5.mose": "5Mo", "deuteronomium": "5Mo", "dtn": "5Mo", "deut": "5Mo", "5 mo": "5Mo", "5.mo": "5Mo", "5mo": "5Mo",
  // Geschichtsbücher
  "josua": "Jos", "jos": "Jos",
  "richter": "Ri", "ri": "Ri",
  "rut": "Rut", "ruth": "Rut",
  "1. samuel": "1Sam", "1 samuel": "1Sam", "1.samuel": "1Sam", "1 sam": "1Sam", "1.sam": "1Sam", "1sam": "1Sam",
  "2. samuel": "2Sam", "2 samuel": "2Sam", "2.samuel": "2Sam", "2 sam": "2Sam", "2.sam": "2Sam", "2sam": "2Sam",
  "1. könige": "1Kön", "1 könige": "1Kön", "1.könige": "1Kön", "1 kön": "1Kön", "1.kön": "1Kön", "1kön": "1Kön",
  "2. könige": "2Kön", "2 könige": "2Kön", "2.könige": "2Kön", "2 kön": "2Kön", "2.kön": "2Kön", "2kön": "2Kön",
  "1. chronik": "1Chr", "1 chronik": "1Chr", "1.chronik": "1Chr", "1 chr": "1Chr", "1.chr": "1Chr", "1chr": "1Chr",
  "2. chronik": "2Chr", "2 chronik": "2Chr", "2.chronik": "2Chr", "2 chr": "2Chr", "2.chr": "2Chr", "2chr": "2Chr",
  "esra": "Esr", "esr": "Esr",
  "nehemia": "Neh", "neh": "Neh",
  "ester": "Est", "esther": "Est", "est": "Est",
  // Weisheitsbücher
  "hiob": "Hi", "hi": "Hi", "ijob": "Hi",
  "psalm": "Ps", "psalmen": "Ps", "ps": "Ps",
  "sprüche": "Spr", "spr": "Spr", "sprichwörter": "Spr",
  "prediger": "Pred", "pred": "Pred", "kohelet": "Pred",
  "hohelied": "Hld", "hld": "Hld", "hohe lied": "Hld",
  // Große Propheten
  "jesaja": "Jes", "jes": "Jes",
  "jeremia": "Jer", "jer": "Jer",
  "klagelieder": "Klgl", "klgl": "Klgl",
  "hesekiel": "Hes", "hes": "Hes", "ezechiel": "Hes",
  "daniel": "Dan", "dan": "Dan",
  // Kleine Propheten
  "hosea": "Hos", "hos": "Hos",
  "joel": "Joel",
  "amos": "Am", "am": "Am",
  "obadja": "Ob", "ob": "Ob",
  "jona": "Jona",
  "micha": "Mi", "mi": "Mi",
  "nahum": "Nah", "nah": "Nah",
  "habakuk": "Hab", "hab": "Hab",
  "zefanja": "Zef", "zef": "Zef",
  "haggai": "Hag", "hag": "Hag",
  "sacharja": "Sach", "sach": "Sach",
  "maleachi": "Mal", "mal": "Mal",
  // NT - Evangelien & Apostelgeschichte
  "matthäus": "Mt", "mt": "Mt", "matt": "Mt",
  "markus": "Mk", "mk": "Mk",
  "lukas": "Lk", "lk": "Lk",
  "johannes": "Joh", "joh": "Joh",
  "apostelgeschichte": "Apg", "apg": "Apg",
  // Paulusbriefe
  "römer": "Röm", "röm": "Röm",
  "1. korinther": "1Kor", "1 korinther": "1Kor", "1.korinther": "1Kor", "1 kor": "1Kor", "1.kor": "1Kor", "1kor": "1Kor",
  "2. korinther": "2Kor", "2 korinther": "2Kor", "2.korinther": "2Kor", "2 kor": "2Kor", "2.kor": "2Kor", "2kor": "2Kor",
  "galater": "Gal", "gal": "Gal",
  "epheser": "Eph", "eph": "Eph",
  "philipper": "Phil", "phil": "Phil",
  "kolosser": "Kol", "kol": "Kol",
  "1. thessalonicher": "1Thess", "1 thessalonicher": "1Thess", "1.thessalonicher": "1Thess", "1 thess": "1Thess", "1.thess": "1Thess", "1thess": "1Thess",
  "2. thessalonicher": "2Thess", "2 thessalonicher": "2Thess", "2.thessalonicher": "2Thess", "2 thess": "2Thess", "2.thess": "2Thess", "2thess": "2Thess",
  "1. timotheus": "1Tim", "1 timotheus": "1Tim", "1.timotheus": "1Tim", "1 tim": "1Tim", "1.tim": "1Tim", "1tim": "1Tim",
  "2. timotheus": "2Tim", "2 timotheus": "2Tim", "2.timotheus": "2Tim", "2 tim": "2Tim", "2.tim": "2Tim", "2tim": "2Tim",
  "titus": "Tit", "tit": "Tit",
  "philemon": "Phlm", "phlm": "Phlm",
  // Weitere NT-Briefe
  "hebräer": "Hebr", "hebr": "Hebr",
  "jakobus": "Jak", "jak": "Jak",
  "1. petrus": "1Petr", "1 petrus": "1Petr", "1.petrus": "1Petr", "1 petr": "1Petr", "1.petr": "1Petr", "1petr": "1Petr",
  "2. petrus": "2Petr", "2 petrus": "2Petr", "2.petrus": "2Petr", "2 petr": "2Petr", "2.petr": "2Petr", "2petr": "2Petr",
  "1. johannes": "1Joh", "1 johannes": "1Joh", "1.johannes": "1Joh", "1 joh": "1Joh", "1.joh": "1Joh", "1joh": "1Joh",
  "2. johannes": "2Joh", "2 johannes": "2Joh", "2.johannes": "2Joh", "2 joh": "2Joh", "2.joh": "2Joh", "2joh": "2Joh",
  "3. johannes": "3Joh", "3 johannes": "3Joh", "3.johannes": "3Joh", "3 joh": "3Joh", "3.joh": "3Joh", "3joh": "3Joh",
  "judas": "Jud", "jud": "Jud",
  "offenbarung": "Offb", "offb": "Offb",
};

// Build sorted keys (longest first) to avoid partial matches
const BOOK_KEYS = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);

// Build regex: book name + chapter[,verse[-verse]]
// Matches patterns like: "Röm 8,28", "1 Kor 1,2-4", "Psalm 23", "1. Mose 3,15", "Joh 3,16"
const bookPattern = BOOK_KEYS.map((k) =>
  k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|");

const BIBLE_REF_REGEX = new RegExp(
  `(?<![\\wäöüÄÖÜ])(${bookPattern})\\s+(\\d{1,3})(?:[,.]\\s*(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?(?![\\wäöüÄÖÜ])`,
  "gi"
);

function normalizeBook(raw: string): string | null {
  const lower = raw.toLowerCase().replace(/\s+/g, " ").trim();
  return BOOK_MAP[lower] ?? null;
}

/** BibleServer-compatible book name mapping */
const BIBLESERVER_BOOKS: Record<string, string> = {
  "1Mo": "1.Mose", "2Mo": "2.Mose", "3Mo": "3.Mose", "4Mo": "4.Mose", "5Mo": "5.Mose",
  "Jos": "Josua", "Ri": "Richter", "Rut": "Rut",
  "1Sam": "1.Samuel", "2Sam": "2.Samuel", "1Kön": "1.Könige", "2Kön": "2.Könige",
  "1Chr": "1.Chronik", "2Chr": "2.Chronik", "Esr": "Esra", "Neh": "Nehemia", "Est": "Ester",
  "Hi": "Hiob", "Ps": "Psalm", "Spr": "Sprüche", "Pred": "Prediger", "Hld": "Hohelied",
  "Jes": "Jesaja", "Jer": "Jeremia", "Klgl": "Klagelieder", "Hes": "Hesekiel", "Dan": "Daniel",
  "Hos": "Hosea", "Joel": "Joel", "Am": "Amos", "Ob": "Obadja", "Jona": "Jona",
  "Mi": "Micha", "Nah": "Nahum", "Hab": "Habakuk", "Zef": "Zefanja",
  "Hag": "Haggai", "Sach": "Sacharja", "Mal": "Maleachi",
  "Mt": "Matthäus", "Mk": "Markus", "Lk": "Lukas", "Joh": "Johannes", "Apg": "Apostelgeschichte",
  "Röm": "Römer", "1Kor": "1.Korinther", "2Kor": "2.Korinther",
  "Gal": "Galater", "Eph": "Epheser", "Phil": "Philipper", "Kol": "Kolosser",
  "1Thess": "1.Thessalonicher", "2Thess": "2.Thessalonicher",
  "1Tim": "1.Timotheus", "2Tim": "2.Timotheus", "Tit": "Titus", "Phlm": "Philemon",
  "Hebr": "Hebräer", "Jak": "Jakobus",
  "1Petr": "1.Petrus", "2Petr": "2.Petrus",
  "1Joh": "1.Johannes", "2Joh": "2.Johannes", "3Joh": "3.Johannes",
  "Jud": "Judas", "Offb": "Offenbarung",
};

export function getBibleServerBook(code: string): string {
  return BIBLESERVER_BOOKS[code] ?? code;
}

/** bolls.life API numeric book IDs (standard Bible order) */
const BOOK_NUM_MAP: Record<string, number> = {
  "1Mo": 1, "2Mo": 2, "3Mo": 3, "4Mo": 4, "5Mo": 5,
  "Jos": 6, "Ri": 7, "Rut": 8,
  "1Sam": 9, "2Sam": 10, "1Kön": 11, "2Kön": 12,
  "1Chr": 13, "2Chr": 14, "Esr": 15, "Neh": 16, "Est": 17,
  "Hi": 18, "Ps": 19, "Spr": 20, "Pred": 21, "Hld": 22,
  "Jes": 23, "Jer": 24, "Klgl": 25, "Hes": 26, "Dan": 27,
  "Hos": 28, "Joel": 29, "Am": 30, "Ob": 31, "Jona": 32,
  "Mi": 33, "Nah": 34, "Hab": 35, "Zef": 36,
  "Hag": 37, "Sach": 38, "Mal": 39,
  "Mt": 40, "Mk": 41, "Lk": 42, "Joh": 43, "Apg": 44,
  "Röm": 45, "1Kor": 46, "2Kor": 47,
  "Gal": 48, "Eph": 49, "Phil": 50, "Kol": 51,
  "1Thess": 52, "2Thess": 53,
  "1Tim": 54, "2Tim": 55, "Tit": 56, "Phlm": 57,
  "Hebr": 58, "Jak": 59,
  "1Petr": 60, "2Petr": 61,
  "1Joh": 62, "2Joh": 63, "3Joh": 64,
  "Jud": 65, "Offb": 66,
};

export function getBookNum(code: string): number | null {
  return BOOK_NUM_MAP[code] ?? null;
}

export function parseBibleReferences(text: string): BibleRef[] {
  const results: BibleRef[] = [];
  // Reset regex state
  BIBLE_REF_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = BIBLE_REF_REGEX.exec(text)) !== null) {
    const bookRaw = match[1];
    const book = normalizeBook(bookRaw);
    if (!book) continue;

    const chapter = parseInt(match[2], 10);
    const verseStart = match[3] ? parseInt(match[3], 10) : undefined;
    const verseEnd = match[4] ? parseInt(match[4], 10) : undefined;

    const versePart = verseStart
      ? verseEnd
        ? `,${verseStart}-${verseEnd}`
        : `,${verseStart}`
      : "";
    const key = `${book}.${chapter}${versePart}`;

    results.push({
      book,
      chapter,
      verseStart,
      verseEnd,
      key,
      raw: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return results;
}
