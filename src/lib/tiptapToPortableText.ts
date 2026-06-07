type TipTapMark = { type: string; attrs?: Record<string, unknown> };
type TipTapNode = {
  type: string;
  text?: string;
  marks?: TipTapMark[];
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
};

type MarkDef = Record<string, unknown>;

function convertInline(node: TipTapNode, markDefs: MarkDef[]) {
  if (node.type === "text") {
    const marks: string[] = [];
    for (const m of node.marks ?? []) {
      if (m.type === "bold") {
        marks.push("strong");
      } else if (m.type === "italic") {
        marks.push("em");
      } else if (m.type === "link") {
        const key = crypto.randomUUID();
        markDefs.push({ _type: "link", _key: key, href: m.attrs?.href ?? "" });
        marks.push(key);
      } else if (m.type === "infocard") {
        const key = crypto.randomUUID();
        markDefs.push({ _type: "infocard", _key: key, explanation: m.attrs?.explanation ?? "" });
        marks.push(key);
      } else if (m.type === "internalLink") {
        const key = crypto.randomUUID();
        markDefs.push({ _type: "internalLink", _key: key, slug: m.attrs?.slug ?? "", titleDe: m.attrs?.titleDe ?? "" });
        marks.push(key);
      }
    }
    return {
      _type: "span",
      _key: crypto.randomUUID(),
      text: node.text ?? "",
      marks,
    };
  }
  if (node.type === "footnote") {
    return {
      _type: "footnote",
      _key: crypto.randomUUID(),
      sourceId: node.attrs?.sourceId ?? null,
      text: node.attrs?.text ?? "",
      pages: node.attrs?.pages ?? "",
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
      const markDefs: MarkDef[] = [];
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        children: (node.content ?? []).map((n) => convertInline(n, markDefs)).filter(Boolean),
        markDefs,
      });
    } else if (node.type === "heading") {
      const markDefs: MarkDef[] = [];
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: headingStyle(node.attrs?.level as number),
        children: (node.content ?? []).map((n) => convertInline(n, markDefs)).filter(Boolean),
        markDefs,
      });
    } else if (node.type === "blockquote") {
      const markDefs: MarkDef[] = [];
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "blockquote",
        children: (node.content?.[0]?.content ?? []).map((n) => convertInline(n, markDefs)).filter(Boolean),
        markDefs,
      });
    } else if (node.type === "bulletList") {
      for (const item of node.content ?? []) {
        const markDefs: MarkDef[] = [];
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "bullet",
          children: (item.content?.[0]?.content ?? []).map((n) => convertInline(n, markDefs)).filter(Boolean),
          markDefs,
        });
      }
    } else if (node.type === "orderedList") {
      for (const item of node.content ?? []) {
        const markDefs: MarkDef[] = [];
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "number",
          children: (item.content?.[0]?.content ?? []).map((n) => convertInline(n, markDefs)).filter(Boolean),
          markDefs,
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
    } else if (node.type === "image" || node.type === "imageBlock") {
      if (node.attrs?.sanityRef) {
        blocks.push({
          _type: "image",
          _key: crypto.randomUUID(),
          asset: { _type: "reference", _ref: node.attrs.sanityRef },
          alt: node.attrs?.alt ?? "",
          caption: node.attrs?.caption ?? "",
          layout: node.attrs?.layout ?? "full",
        });
      }
    }
  }

  return blocks;
}
