import { describe, it, expect } from "vitest";
import { parseBibleReferences } from "../bibleReferences";

describe("parseBibleReferences", () => {
  it("parses a simple reference: Joh 3,16", () => {
    const refs = parseBibleReferences("Wie Joh 3,16 zeigt");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Joh");
    expect(refs[0].chapter).toBe(3);
    expect(refs[0].verseStart).toBe(16);
    expect(refs[0].verseEnd).toBeUndefined();
    expect(refs[0].key).toBe("Joh.3,16");
  });

  it("parses a verse range: Röm 8,28-30", () => {
    const refs = parseBibleReferences("Laut Röm 8,28-30 gilt");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Röm");
    expect(refs[0].chapter).toBe(8);
    expect(refs[0].verseStart).toBe(28);
    expect(refs[0].verseEnd).toBe(30);
    expect(refs[0].key).toBe("Röm.8,28-30");
  });

  it("parses numbered book: 1 Kor 1,2", () => {
    const refs = parseBibleReferences("Vgl. 1 Kor 1,2");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("1Kor");
    expect(refs[0].chapter).toBe(1);
    expect(refs[0].verseStart).toBe(2);
  });

  it("parses dotted numbered book: 1. Mose 3,15", () => {
    const refs = parseBibleReferences("In 1. Mose 3,15 wird");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("1Mo");
    expect(refs[0].chapter).toBe(3);
    expect(refs[0].verseStart).toBe(15);
  });

  it("parses chapter-only reference: Psalm 23", () => {
    const refs = parseBibleReferences("Der bekannte Psalm 23 beschreibt");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Ps");
    expect(refs[0].chapter).toBe(23);
    expect(refs[0].verseStart).toBeUndefined();
  });

  it("parses multiple references in one text", () => {
    const refs = parseBibleReferences("Sowohl Joh 1,1 als auch 1 Kor 15,3 sind zentral");
    expect(refs).toHaveLength(2);
    expect(refs[0].book).toBe("Joh");
    expect(refs[1].book).toBe("1Kor");
  });

  it("handles abbreviations: Mt 28,19", () => {
    const refs = parseBibleReferences("Vgl. Mt 28,19");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Mt");
    expect(refs[0].chapter).toBe(28);
    expect(refs[0].verseStart).toBe(19);
  });

  it("returns empty array for text without references", () => {
    const refs = parseBibleReferences("Dies ist ein normaler Text ohne Bibelstellen.");
    expect(refs).toHaveLength(0);
  });

  it("handles en-dash in verse range: Jes 53,5–6", () => {
    const refs = parseBibleReferences("Siehe Jes 53,5–6");
    expect(refs).toHaveLength(1);
    expect(refs[0].verseStart).toBe(5);
    expect(refs[0].verseEnd).toBe(6);
  });

  it("handles full book name: Matthäus 5,3", () => {
    const refs = parseBibleReferences("Jesus sagt in Matthäus 5,3");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Mt");
    expect(refs[0].chapter).toBe(5);
    expect(refs[0].verseStart).toBe(3);
  });

  it("parses Hebr 4,12", () => {
    const refs = parseBibleReferences("Wie Hebr 4,12 betont");
    expect(refs).toHaveLength(1);
    expect(refs[0].book).toBe("Hebr");
  });
});
