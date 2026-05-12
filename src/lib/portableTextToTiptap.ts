type PTSpan = { _type: "span" | "footnote"; text: string; marks?: string[]; sourceId?: string };
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
  return children.map((span) => {
    if (span._type === "footnote") {
      return {
        type: "footnote",
        attrs: {
          sourceId: (span as any).sourceId ?? null,
          text: (span as any).text ?? "",
        },
      };
    }
    return {
      type: "text",
      text: span.text,
      marks: (span.marks ?? []).map((m) => {
        if (m === "strong") return { type: "bold" };
        if (m === "em") return { type: "italic" };
        return { type: m };
      }),
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
            content: [{ type: "paragraph", content: convertSpans(blocks[i].children) }],
          });
          i++;
        }
        i--; // Back up one since the for loop will increment

        content.push({ type: listType, content: items });
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
