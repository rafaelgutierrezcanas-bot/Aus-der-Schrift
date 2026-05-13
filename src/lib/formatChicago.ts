export interface Source {
  _id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  publisher?: string;
  pages?: string;
}

function normalizeCase(str: string): string {
  if (!str) return str;
  if (str !== str.toUpperCase() || !/[A-ZÜÄÖ]/.test(str)) return str;
  return str
    .toLowerCase()
    .replace(/(^|[\s,;-])([a-züäöß])/g, (_, sep, c) => sep + c.toUpperCase());
}

export function formatChicago(source: Source, citedPages?: string): string {
  const p = citedPages?.trim() || "";
  const pub = normalizeCase(source.publisher ?? "");
  const authors = normalizeCase(source.authors);
  const title = normalizeCase(source.title);

  switch (source.type) {
    case "journal": {
      const pageStr = p ? `: ${p}` : source.pages ? `: ${source.pages}` : "";
      return `${authors}, „${title}," ${pub} (${source.year})${pageStr}.`;
    }
    case "book": {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, ${title} (${pub ? pub + ", " : ""}${source.year})${pageStr}.`;
    }
    case "dissertation": {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, „${title}" (PhD diss., ${pub ? pub + ", " : ""}${source.year})${pageStr}.`;
    }
    case "website": {
      return `${authors}, „${title}," ${pub ? pub + ", " : ""}${source.year}.`;
    }
    case "bible": {
      return p ? `${title} ${p}` : title;
    }
    default: {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, „${title}" (${source.year})${pageStr}.`;
    }
  }
}
