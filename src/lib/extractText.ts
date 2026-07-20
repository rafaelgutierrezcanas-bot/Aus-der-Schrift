/**
 * Extract plain text from Tiptap JSON, replacing footnote nodes with ⟨N⟩ markers.
 * Skips bible verse, image, and imageBlock nodes.
 */
export function extractTextWithMarkers(doc: any): string {
  let fnCount = 0;
  const paragraphs: string[] = [];

  function processNode(node: any): string {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "footnote") {
      fnCount++;
      return `⟨${fnCount}⟩`;
    }
    if (node.content) return node.content.map(processNode).join("");
    return "";
  }

  for (const block of doc.content ?? []) {
    if (block.type === "bibleVerse" || block.type === "image" || block.type === "imageBlock") continue;
    const text = processNode(block).trim();
    if (text) paragraphs.push(text);
  }

  return paragraphs.join("\n\n");
}
