type TipTapMark = { type: string; attrs?: Record<string, unknown> };
type TipTapNode = {
  type: string;
  text?: string;
  marks?: TipTapMark[];
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
};

function convertMarks(marks: TipTapMark[] = []) {
  return marks
    .map((m) => {
      if (m.type === "bold") return { _type: "strong" };
      if (m.type === "italic") return { _type: "em" };
      if (m.type === "link") return { _type: "link", href: m.attrs?.href };
      return null;
    })
    .filter(Boolean);
}

function convertInline(node: TipTapNode) {
  if (node.type === "text") {
    return {
      _type: "span",
      _key: crypto.randomUUID(),
      text: node.text ?? "",
      marks: convertMarks(node.marks).map((m) => (m as { _type: string })._type),
    };
  }
  if (node.type === "footnote") {
    return {
      _type: "footnote",
      _key: crypto.randomUUID(),
      sourceId: node.attrs?.sourceId ?? null,
      text: node.attrs?.text ?? "",
    };
  }
  return null;
}

function headingStyle(level: number): string {
  const map: Record<number, string> = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" };
  return map[level] ?? "normal";
}

export function tiptapToPortableText(doc: TipTapNode): unknown[] {
  const blocks: unknown[] = [];

  for (const node of doc.content ?? []) {
    if (node.type === "paragraph") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        children: (node.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    } else if (node.type === "heading") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: headingStyle(node.attrs?.level as number),
        children: (node.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    } else if (node.type === "blockquote") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "blockquote",
        children: (node.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    } else if (node.type === "bulletList") {
      for (const item of node.content ?? []) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "bullet",
          children: (item.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
          markDefs: [],
        });
      }
    } else if (node.type === "orderedList") {
      for (const item of node.content ?? []) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "number",
          children: (item.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
          markDefs: [],
        });
      }
    } else if (node.type === "bibleVerse") {
      blocks.push({
        _type: "bibleVerse",
        _key: crypto.randomUUID(),
        reference: node.attrs?.reference ?? "",
        text: node.attrs?.text ?? "",
        translation: node.attrs?.translation ?? "",
      });
    } else if (node.type === "image") {
      blocks.push({
        _type: "image",
        _key: crypto.randomUUID(),
        asset: { _type: "reference", _ref: node.attrs?.sanityRef },
        alt: node.attrs?.alt ?? "",
        caption: node.attrs?.caption ?? "",
      });
    }
  }

  return blocks;
}
