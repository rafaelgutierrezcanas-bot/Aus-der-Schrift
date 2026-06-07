type PTMarkDef = { _type: string; _key: string; [key: string]: unknown };
type PTSpan = { _type: "span" | "footnote"; text: string; marks?: string[]; sourceId?: string; pages?: string };
type PTBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: PTSpan[];
  markDefs?: PTMarkDef[];
  reference?: string;
  text?: string;
  translation?: string;
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
};

function convertSpans(children: PTSpan[] = [], markDefs: PTMarkDef[] = []) {
  return children.map((span) => {
    if (span._type === "footnote") {
      return {
        type: "footnote",
        attrs: {
          sourceId: span.sourceId ?? null,
          text: span.text ?? "",
          pages: span.pages ?? "",
        },
      };
    }
    return {
      type: "text",
      text: span.text,
      marks: (span.marks ?? []).map((m) => {
        if (m === "strong") return { type: "bold" };
        if (m === "em") return { type: "italic" };
        // Look up markDef by key
        const def = markDefs.find((d) => d._key === m);
        if (def) {
          if (def._type === "infocard") return { type: "infocard", attrs: { explanation: def.explanation ?? "" } };
          if (def._type === "internalLink") return { type: "internalLink", attrs: { slug: def.slug ?? "", titleDe: def.titleDe ?? "" } };
          if (def._type === "link") return { type: "link", attrs: { href: def.href ?? "" } };
        }
        return { type: m };
      }).filter(Boolean),
    };
  });
}

export function portableTextToTiptap(blocks: PTBlock[]) {
  const content: unknown[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block._type === "block") {
      if (block.listItem === "bullet" || block.listItem === "number") {
        const listType = block.listItem === "bullet" ? "bulletList" : "orderedList";
        const items = [];

        // Collect all consecutive list items of the same type
        while (
          i < blocks.length &&
          blocks[i]._type === "block" &&
          blocks[i].listItem === block.listItem
        ) {
          items.push({
            type: "listItem",
            content: [{ type: "paragraph", content: convertSpans(blocks[i].children, blocks[i].markDefs) }],
          });
          i++;
        }
        i--; // Back up one since the for loop will increment

        content.push({ type: listType, content: items });
      } else if (block.style === "blockquote") {
        content.push({
          type: "blockquote",
          content: [{ type: "paragraph", content: convertSpans(block.children, block.markDefs) }],
        });
      } else if (block.style && block.style.startsWith("h")) {
        const level = parseInt(block.style[1]);
        content.push({
          type: "heading",
          attrs: { level },
          content: convertSpans(block.children, block.markDefs),
        });
      } else {
        content.push({
          type: "paragraph",
          content: convertSpans(block.children, block.markDefs),
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
