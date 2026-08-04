import { describe, it, expect } from "vitest";
import { injectBibleReferences } from "../injectBibleReferences";

function makeBlock(text: string, key = "block1", marks: string[] = [], markDefs: Array<{ _key: string; _type: string }> = []) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs,
    children: [
      {
        _type: "span",
        _key: "span1",
        text,
        marks,
      },
    ],
  };
}

describe("injectBibleReferences", () => {
  it("splits a span containing a bible reference", () => {
    const blocks = [makeBlock("Wie Joh 3,16 zeigt, hat Gott die Welt geliebt.")];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;

    expect(result).toHaveLength(1);
    const children = result[0].children as Array<Record<string, unknown>>;

    // Should have: "Wie " + bibleRefInline + " zeigt, hat Gott die Welt geliebt."
    expect(children).toHaveLength(3);
    expect(children[0]._type).toBe("span");
    expect(children[0].text).toBe("Wie ");
    expect(children[1]._type).toBe("bibleRefInline");
    expect((children[1] as { rawText: string }).rawText).toBe("Joh 3,16");
    expect(children[2]._type).toBe("span");
    expect(children[2].text).toBe(" zeigt, hat Gott die Welt geliebt.");
  });

  it("does not modify blocks without bible references", () => {
    const blocks = [makeBlock("Ein normaler Text ohne Bibelstellen.")];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;
    const children = result[0].children as Array<Record<string, unknown>>;
    expect(children).toHaveLength(1);
    expect(children[0].text).toBe("Ein normaler Text ohne Bibelstellen.");
  });

  it("skips non-block types (bibleVerse, image)", () => {
    const blocks = [
      { _type: "bibleVerse", _key: "bv1", reference: "Joh 3,16", text: "Also hat Gott..." },
    ];
    const result = injectBibleReferences(blocks);
    expect(result).toEqual(blocks);
  });

  it("skips spans with infocard marks", () => {
    const blocks = [
      makeBlock(
        "Das Wort Joh 3,16 erklärt das Evangelium",
        "b1",
        ["md1"],
        [{ _key: "md1", _type: "infocard" }]
      ),
    ];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;
    const children = result[0].children as Array<Record<string, unknown>>;
    // Should NOT split because span has infocard mark
    expect(children).toHaveLength(1);
    expect(children[0]._type).toBe("span");
  });

  it("handles multiple references in one span", () => {
    const blocks = [makeBlock("Sowohl Joh 1,1 als auch Röm 8,28 sind zentral.")];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;
    const children = result[0].children as Array<Record<string, unknown>>;

    // "Sowohl " + bibleRef + " als auch " + bibleRef + " sind zentral."
    expect(children).toHaveLength(5);
    expect(children[1]._type).toBe("bibleRefInline");
    expect(children[3]._type).toBe("bibleRefInline");
  });

  it("handles reference at the start of text", () => {
    const blocks = [makeBlock("Joh 3,16 ist wichtig")];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;
    const children = result[0].children as Array<Record<string, unknown>>;

    // bibleRef + " ist wichtig"
    expect(children).toHaveLength(2);
    expect(children[0]._type).toBe("bibleRefInline");
    expect(children[1].text).toBe(" ist wichtig");
  });

  it("handles reference at the end of text", () => {
    const blocks = [makeBlock("Siehe Joh 3,16")];
    const result = injectBibleReferences(blocks) as Array<Record<string, unknown>>;
    const children = result[0].children as Array<Record<string, unknown>>;

    // "Siehe " + bibleRef
    expect(children).toHaveLength(2);
    expect(children[0].text).toBe("Siehe ");
    expect(children[1]._type).toBe("bibleRefInline");
  });
});
