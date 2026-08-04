export interface PortableTextBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: Array<{ text: string }>;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(body: PortableTextBlock[]): TocItem[] {
  return body
    .filter((b) => b._type === "block" && (b.style === "h2" || b.style === "h3"))
    .map((b) => ({
      id: b._key,
      text: b.children?.map((c) => c.text).join("") || "",
      level: b.style === "h2" ? 2 : 3,
    }));
}
