import type { Source } from "./formatChicago";

interface TipTapNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
}

interface Footnote {
  sourceId?: string;
  text?: string;
  pages?: string;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

export function tiptapToMarkdown(
  doc: { type: string; content?: TipTapNode[] },
  sources?: Source[]
): string {
  const footnotes: Footnote[] = [];
  const blocks: string[] = [];

  function inlineToMarkdown(nodes: TipTapNode[]): string {
    let result = "";
    for (const node of nodes) {
      if (node.type === "text") {
        let text = node.text ?? "";
        const isBold = node.marks?.some((m) => m.type === "bold");
        const isItalic = node.marks?.some((m) => m.type === "italic");
        if (isBold) text = `**${text}**`;
        if (isItalic) text = `*${text}*`;

        // Wrap with infocard mark
        const infoMark = node.marks?.find((m) => m.type === "infocard");
        if (infoMark) {
          const explanation = escapeAttr((infoMark.attrs?.explanation as string) ?? "");
          text = `<!-- info explanation="${explanation}" -->${text}<!-- /info -->`;
        }

        // Wrap with internalLink mark
        const linkMark = node.marks?.find((m) => m.type === "internalLink");
        if (linkMark) {
          const slug = escapeAttr((linkMark.attrs?.slug as string) ?? "");
          const title = escapeAttr((linkMark.attrs?.title as string) ?? "");
          text = `<!-- link slug="${slug}" title="${title}" -->${text}<!-- /link -->`;
        }

        result += text;
      } else if (node.type === "footnote") {
        footnotes.push({
          sourceId: (node.attrs?.sourceId as string) || undefined,
          text: (node.attrs?.text as string) || undefined,
          pages: (node.attrs?.pages as string) || undefined,
        });
        result += `[^${footnotes.length}]`;
      } else if (node.type === "hardBreak") {
        result += "\n";
      }
    }
    return result;
  }

  function processBlock(node: TipTapNode, listPrefix?: string): string {
    switch (node.type) {
      case "paragraph":
        return (listPrefix ?? "") + inlineToMarkdown(node.content ?? []);

      case "heading": {
        const level = (node.attrs?.level as number) ?? 2;
        const prefix = "#".repeat(level) + " ";
        return prefix + inlineToMarkdown(node.content ?? []);
      }

      case "blockquote": {
        const inner = (node.content ?? [])
          .map((child) => processBlock(child))
          .join("\n\n");
        return inner
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");
      }

      case "bulletList":
        return (node.content ?? [])
          .map((li) => {
            const liContent = (li.content ?? [])
              .map((child) => processBlock(child, "- "))
              .join("\n");
            return liContent;
          })
          .join("\n");

      case "orderedList":
        return (node.content ?? [])
          .map((li, i) => {
            const liContent = (li.content ?? [])
              .map((child) => processBlock(child, `${i + 1}. `))
              .join("\n");
            return liContent;
          })
          .join("\n");

      case "bibleVerse": {
        const ref = (node.attrs?.reference as string) ?? "";
        const text = (node.attrs?.text as string) ?? "";
        const trans = (node.attrs?.translation as string) ?? "";
        return `> \u{1F4D6} [${ref}] ${text} (${trans})`;
      }

      case "imageBlock": {
        const ref = escapeAttr((node.attrs?.src as string) ?? "");
        const alt = escapeAttr((node.attrs?.alt as string) ?? "");
        const caption = escapeAttr((node.attrs?.caption as string) ?? "");
        const layout = escapeAttr((node.attrs?.layout as string) ?? "");
        return `<!-- img ref="${ref}" alt="${alt}" caption="${caption}" layout="${layout}" -->`;
      }

      default:
        if (node.content) {
          return inlineToMarkdown(node.content);
        }
        return "";
    }
  }

  for (const block of doc.content ?? []) {
    const md = processBlock(block);
    if (md !== undefined) blocks.push(md);
  }

  let result = blocks.join("\n\n");

  // Append footnote definitions
  if (footnotes.length > 0) {
    result += "\n\n---\n";
    for (let i = 0; i < footnotes.length; i++) {
      const fn = footnotes[i];
      if (fn.sourceId) {
        let def = `source:${fn.sourceId}`;
        if (fn.pages) def += `|pages:${fn.pages}`;
        result += `\n[^${i + 1}]: ${def}`;
      } else {
        result += `\n[^${i + 1}]: ${fn.text ?? ""}`;
      }
    }
    result += "\n";
  }

  // Prepend header comment
  result = `<!-- THEOLOGIK \u2014 Markierungen bitte nicht entfernen -->\n\n${result}`;

  return result;
}
