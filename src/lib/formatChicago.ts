export interface Source {
  _id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  // For books: publisher name. For journals: journal name.
  publisher?: string;
  // Journal-specific
  volume?: string;
  issue?: string;
  // Book-specific
  city?: string;
  edition?: string;
  // Common
  doi?: string;
  pages?: string;
  url?: string;
}

function normalizeCase(str: string): string {
  if (!str) return str;
  if (str !== str.toUpperCase() || !/[A-ZÜÄÖ]/.test(str)) return str;
  return str
    .toLowerCase()
    .replace(/(^|[\s,;-])([a-züäöß])/g, (_, sep, c) => sep + c.toUpperCase());
}

/**
 * Formats a source in APA 7 style.
 * If citedPages is provided (specific page being cited), it is appended.
 *
 * Journal example:
 *   McBrayer, J. P., & Swenson, P. (2012). Scepticism about the argument from
 *   divine hiddenness. Religious Studies, 48(2), 129–150.
 *   https://doi.org/10.1017/S003441251100014X
 *
 * Book example:
 *   Pannenberg, W. (1988). Systematische Theologie. Göttingen: Vandenhoeck & Ruprecht.
 */
export function formatChicago(source: Source, citedPages?: string): string {
  const authors = normalizeCase(source.authors ?? "");
  const title = normalizeCase(source.title ?? "");
  const pub = normalizeCase(source.publisher ?? "");
  const year = source.year;
  const cited = citedPages?.trim() || "";
  const doi = source.doi?.trim();
  const doiUrl = doi ? `https://doi.org/${doi}` : (source.url?.trim() ?? "");

  switch (source.type) {
    case "journal": {
      // APA: Authors (Year). Title. Journal Name, Volume(Issue), pages. DOI
      let volIssue = "";
      if (source.volume && source.issue) volIssue = `${source.volume}(${source.issue})`;
      else if (source.volume) volIssue = source.volume;
      else if (source.issue) volIssue = `(${source.issue})`;

      const articlePages = cited || source.pages || "";
      const pagesPart = articlePages ? `, ${articlePages}` : "";
      const journalPart = [pub, volIssue].filter(Boolean).join(", ");
      const doiPart = doiUrl ? ` ${doiUrl}` : "";
      return `${authors} (${year}). ${title}. ${journalPart}${pagesPart}.${doiPart}`.trim();
    }

    case "book": {
      // APA: Authors (Year). Title (Xth ed.). City: Publisher.
      const edPart = source.edition ? ` (${source.edition}. Aufl.)` : "";
      const placePub = [source.city, pub].filter(Boolean).join(": ");
      const placePublisher = placePub ? ` ${placePub}.` : ".";
      const citedPart = cited ? ` S.${cited}.` : "";
      return `${authors} (${year}). ${title}${edPart}.${placePublisher}${citedPart}`.trim();
    }

    case "dissertation": {
      // APA: Author (Year). Title [Doctoral dissertation, University]. Source.
      const instPart = pub ? `, ${pub}` : "";
      const citedPart = cited ? ` S.${cited}.` : "";
      return `${authors} (${year}). ${title} [Dissertation${instPart}].${citedPart}`.trim();
    }

    case "website": {
      const urlPart = doiUrl ? ` ${doiUrl}` : "";
      const sitePart = pub ? ` ${pub}.` : "";
      return `${authors} (${year}). ${title}.${sitePart}${urlPart}`.trim();
    }

    case "bible": {
      return cited ? `${title} ${cited}` : title;
    }

    default: {
      const citedPart = cited ? `, S.${cited}` : "";
      return `${authors} (${year}). ${title}${citedPart}.`;
    }
  }
}
