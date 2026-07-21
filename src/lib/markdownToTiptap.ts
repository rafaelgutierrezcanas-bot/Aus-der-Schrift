interface TipTapNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
}

interface FootnoteDef {
  sourceId?: string;
  pages?: string;
  text?: string;
}

function unescapeAttr(value: string): string {
  return value.replace(/&quot;/g, '"');
}

export function markdownToTiptap(markdown: string): { type: "doc"; content: TipTapNode[] } {
  // Strip header comment
  let cleaned = markdown.replace(/^<!--\s*THEOLOGIK\s*\u2014[^>]*-->\s*\n*/u, "");

  // 1. Split footnote definitions from body
  const { body, footnotes } = extractFootnotes(cleaned);

  // 2. Parse body into blocks
  const lines = body.split("\n");
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule (skip, used as footnote separator)
    if (/^---+$/.test(line.trim())) {
      i++;
      continue;
    }

    // Image comment: <!-- img ref="..." alt="..." caption="..." layout="..." -->
    const imgMatch = line.match(/^<!--\s*img\s+ref="([^"]*)"\s+alt="([^"]*)"\s+caption="([^"]*)"\s+layout="([^"]*)"\s*-->$/);
    if (imgMatch) {
      content.push({
        type: "imageBlock",
        attrs: {
          src: unescapeAttr(imgMatch[1]),
          alt: unescapeAttr(imgMatch[2]),
          caption: unescapeAttr(imgMatch[3]),
          layout: unescapeAttr(imgMatch[4]),
        },
      });
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      content.push({
        type: "heading",
        attrs: { level },
        content: parseInline(headingMatch[2], footnotes),
      });
      i++;
      continue;
    }

    // Bible verse blockquote: > 📖 [ref] text (trans)
    const bibleMatch = line.match(/^>\s*\u{1F4D6}\s*\[([^\]]*)\]\s*(.*?)\s*\(([^)]*)\)\s*$/u);
    if (bibleMatch) {
      content.push({
        type: "bibleVerse",
        attrs: {
          reference: bibleMatch[1],
          text: bibleMatch[2],
          translation: bibleMatch[3],
        },
      });
      i++;
      continue;
    }

    // Blockquote (multi-line)
    if (line.startsWith("> ") || line === ">") {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const quoteText = quoteLines.join("\n");
      // Parse inner paragraphs
      const innerParagraphs = quoteText.split(/\n\n+/).filter((p) => p.trim());
      content.push({
        type: "blockquote",
        content: innerParagraphs.map((p) => ({
          type: "paragraph",
          content: parseInline(p.replace(/\n/g, " "), footnotes),
        })),
      });
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-*]\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInline(itemText, footnotes),
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: TipTapNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s+/, "");
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInline(itemText, footnotes),
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    // Regular paragraph (collect consecutive non-empty, non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      lines[i] !== ">" &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^<!--\s*img\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const text = paraLines.join(" ");
      content.push({
        type: "paragraph",
        content: parseInline(text, footnotes),
      });
    }
  }

  return { type: "doc", content };
}

function extractFootnotes(markdown: string): { body: string; footnotes: Map<number, FootnoteDef> } {
  const footnotes = new Map<number, FootnoteDef>();

  // Find all footnote definitions: [^N]: ...
  const fnRegex = /^\[\^(\d+)\]:\s*(.+)$/gm;
  let match;
  while ((match = fnRegex.exec(markdown)) !== null) {
    const num = parseInt(match[1], 10);
    const value = match[2].trim();

    // Parse source:abc123|pages:152-154
    const sourceMatch = value.match(/^source:([^|]+?)(?:\|pages:(.+))?$/);
    if (sourceMatch) {
      footnotes.set(num, {
        sourceId: sourceMatch[1],
        pages: sourceMatch[2] || undefined,
      });
    } else {
      footnotes.set(num, { text: value });
    }
  }

  // Remove footnote definitions and the --- separator before them from body
  const body = markdown
    .replace(/\n---\n(?:\s*\[\^\d+\]:.*\n?)+$/, "")
    .replace(/^\[\^(\d+)\]:\s*.+$/gm, "")
    .trimEnd();

  return { body, footnotes };
}

function parseInline(text: string, footnotes: Map<number, FootnoteDef>): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  // Tokenize with extended patterns including HTML comment marks
  const tokenRegex =
    /<!-- info explanation="([^"]*)" -->|<!-- \/info -->|<!-- link slug="([^"]*)" title="([^"]*)" -->|<!-- \/link -->|(\[\^\d+\])|\*\*(.+?)\*\*|\*(.+?)\*/g;

  const activeMarks: Array<{ type: string; attrs?: Record<string, unknown> }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Add preceding plain text with active marks
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain) {
        const node: TipTapNode = { type: "text", text: plain };
        if (activeMarks.length > 0) {
          node.marks = activeMarks.map((m) => ({ ...m }));
        }
        nodes.push(node);
      }
    }

    if (match[1] !== undefined) {
      // <!-- info explanation="..." --> opening
      activeMarks.push({
        type: "infocard",
        attrs: { explanation: unescapeAttr(match[1]) },
      });
    } else if (match[0] === "<!-- /info -->") {
      // <!-- /info --> closing
      const idx = activeMarks.findLastIndex((m) => m.type === "infocard");
      if (idx !== -1) activeMarks.splice(idx, 1);
    } else if (match[2] !== undefined) {
      // <!-- link slug="..." title="..." --> opening
      activeMarks.push({
        type: "internalLink",
        attrs: {
          slug: unescapeAttr(match[2]),
          title: unescapeAttr(match[3]),
        },
      });
    } else if (match[0] === "<!-- /link -->") {
      // <!-- /link --> closing
      const idx = activeMarks.findLastIndex((m) => m.type === "internalLink");
      if (idx !== -1) activeMarks.splice(idx, 1);
    } else if (match[4]) {
      // Footnote marker [^N]
      const num = parseInt(match[4].replace(/\[\^|\]/g, ""), 10);
      const def = footnotes.get(num);
      nodes.push({
        type: "footnote",
        attrs: {
          sourceId: def?.sourceId ?? null,
          text: def?.text ?? "",
          pages: def?.pages ?? "",
        },
      });
    } else if (match[5]) {
      // Bold **text**
      const node: TipTapNode = {
        type: "text",
        text: match[5],
        marks: [...activeMarks.map((m) => ({ ...m })), { type: "bold" }],
      };
      nodes.push(node);
    } else if (match[6]) {
      // Italic *text*
      const node: TipTapNode = {
        type: "text",
        text: match[6],
        marks: [...activeMarks.map((m) => ({ ...m })), { type: "italic" }],
      };
      nodes.push(node);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      const node: TipTapNode = { type: "text", text: remaining };
      if (activeMarks.length > 0) {
        node.marks = activeMarks.map((m) => ({ ...m }));
      }
      nodes.push(node);
    }
  }

  // Ensure at least one text node for empty paragraphs
  if (nodes.length === 0) {
    nodes.push({ type: "text", text: "" });
  }

  return nodes;
}
