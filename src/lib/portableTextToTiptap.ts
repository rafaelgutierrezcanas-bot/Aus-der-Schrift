type PTSpan = { _type: "span"; text: string; marks?: string[] };
type PTBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: PTSpan[];
  reference?: string;
  text?: string;
  translation?: string;
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
};

function convertSpans(children: PTSpan[] = []) {
  return children.map((span) => ({
    type: "text",
    text: span.text,
    marks: (span.marks ?? []).map((m) => {
      if (m === "strong") return { type: "bold" };
      if (m === "em") return { type: "italic" };
      return { type: m };
    }),
  }));
}

export function portableTextToTiptap(blocks: PTBlock[]) {
  const content: unknown[] = [];

  for (const block of blocks) {
    if (block._type === "block") {
      if (block.listItem === "bullet") {
        content.push({
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: convertSpans(block.children) }] }],
        });
      } else if (block.listItem === "number") {
        content.push({
          type: "orderedList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: convertSpans(block.children) }] }],
        });
      } else if (block.style === "blockquote") {
        content.push({
          type: "blockquote",
          content: [{ type: "paragraph", content: convertSpans(block.children) }],
        });
      } else if (block.style && block.style.startsWith("h")) {
        const level = parseInt(block.style[1]);
        content.push({
          type: "heading",
          attrs: { level },
          content: convertSpans(block.children),
        });
      } else {
        content.push({
          type: "paragraph",
          content: convertSpans(block.children),
        });
      }
    } else if (block._type === "bibleVerse") {
      content.push({
        type: "bibleVerse",
        attrs: {
          reference: block.reference ?? "",
          text: block.text ?? "",
          translation: block.translation ?? "",
        },
      });
    } else if (block._type === "image") {
      content.push({
        type: "image",
        attrs: {
          sanityRef: block.asset?._ref,
          alt: block.alt ?? "",
          caption: block.caption ?? "",
        },
      });
    }
  }

  return { type: "doc", content };
}
