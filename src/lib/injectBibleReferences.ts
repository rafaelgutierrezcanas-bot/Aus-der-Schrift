import { parseBibleReferences, type BibleRef } from "./bibleReferences";

interface Span {
  _type: string;
  _key: string;
  text?: string;
  marks?: string[];
  [key: string]: unknown;
}

interface Block {
  _type: string;
  _key: string;
  style?: string;
  children?: Span[];
  markDefs?: Array<{ _key: string; _type: string }>;
  [key: string]: unknown;
}

let keyCounter = 0;
function genKey(): string {
  return `bref${++keyCounter}`;
}

/** Marks that should NOT be wrapped with bible ref tooltips */
const SKIP_MARKS = new Set(["infocard", "internalLink"]);

function hasSkipMark(span: Span, markDefs: Array<{ _key: string; _type: string }>): boolean {
  if (!span.marks || span.marks.length === 0) return false;
  const markDefMap = new Map(markDefs.map((md) => [md._key, md._type]));
  return span.marks.some((m) => {
    // Built-in marks like "strong", "em" are fine
    const markType = markDefMap.get(m);
    return markType ? SKIP_MARKS.has(markType) : false;
  });
}

function splitSpanByRefs(span: Span, refs: BibleRef[], markDefs: Array<{ _key: string; _type: string }>): (Span | { _type: "bibleRefInline"; _key: string; ref: BibleRef; rawText: string })[] {
  const text = span.text ?? "";
  if (!text || refs.length === 0) return [span];
  if (hasSkipMark(span, markDefs)) return [span];

  // Find refs that fall within this span's text
  const spanRefs = parseBibleReferences(text);
  if (spanRefs.length === 0) return [span];

  const result: (Span | { _type: "bibleRefInline"; _key: string; ref: BibleRef; rawText: string })[] = [];
  let lastEnd = 0;

  for (const ref of spanRefs) {
    // Text before the reference
    if (ref.startIndex > lastEnd) {
      result.push({
        ...span,
        _key: genKey(),
        text: text.slice(lastEnd, ref.startIndex),
      });
    }

    // The bible reference inline object
    result.push({
      _type: "bibleRefInline",
      _key: genKey(),
      ref,
      rawText: ref.raw,
    });

    lastEnd = ref.endIndex;
  }

  // Text after the last reference
  if (lastEnd < text.length) {
    result.push({
      ...span,
      _key: genKey(),
      text: text.slice(lastEnd),
    });
  }

  return result;
}

/**
 * Scans Portable Text blocks for Bible references in text spans,
 * and injects `bibleRefInline` inline objects that the renderer can pick up.
 */
export function injectBibleReferences(blocks: unknown[]): unknown[] {
  // Reset key counter each call for deterministic keys in tests
  keyCounter = 0;

  return (blocks as Block[]).map((block) => {
    // Only process standard text blocks
    if (block._type !== "block" || !Array.isArray(block.children)) {
      return block;
    }

    const markDefs = block.markDefs ?? [];
    const allText = block.children
      .filter((c) => c._type === "span" && c.text)
      .map((c) => c.text)
      .join("");

    // Quick check: any bible references in the entire block text?
    const blockRefs = parseBibleReferences(allText);
    if (blockRefs.length === 0) return block;

    // Process each child span
    const newChildren: unknown[] = [];
    for (const child of block.children) {
      if (child._type === "span" && child.text) {
        const parts = splitSpanByRefs(child, blockRefs, markDefs);
        newChildren.push(...parts);
      } else {
        newChildren.push(child);
      }
    }

    return { ...block, children: newChildren };
  });
}
