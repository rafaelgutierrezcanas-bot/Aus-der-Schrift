export interface TextSegment {
  type: "text";
  value: string;
}

export interface FootnoteSegment {
  type: "footnote";
  number: number;
}

export type Segment = TextSegment | FootnoteSegment;

/**
 * Parses [[N]] markers in text into an array of text and footnote segments.
 */
export function parseFootnotes(text: string): Segment[] {
  const parts = text.split(/\[\[(\d+)\]\]/);
  const segments: Segment[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) {
        segments.push({ type: "text", value: parts[i] });
      }
    } else {
      segments.push({ type: "footnote", number: parseInt(parts[i], 10) });
    }
  }

  return segments;
}
