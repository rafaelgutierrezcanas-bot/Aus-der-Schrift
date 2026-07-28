// Types derived from content/bibelstudium/schemas/

export interface Citation {
  sourceId: string;
  pages: string;
  function: string;
}

export interface UnitMeta {
  schemaVersion: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  stations: string[];
  citations: Citation[];
}

export interface Station {
  schemaVersion: string;
  id: string;
  type: string;
  title: string;
  instructions: string;
  content: Record<string, unknown>;
  citations: Citation[];
  status?: "entwurf" | "belegt" | "reviewed";
}

export interface Exercise {
  schemaVersion: string;
  id: string;
  slug: string;
  title: string;
  type: string;
  instructions: string;
  content: Record<string, unknown>;
  citations: Citation[];
}

export interface MethodStep {
  title: string;
  description: string;
}

export interface Method {
  schemaVersion: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  steps: MethodStep[];
  citations: Citation[];
}

export interface BibleText {
  schemaVersion: string;
  id: string;
  reference: string;
  translation: string;
  text: string;
  citations: Citation[];
}

export interface BibliographyEntry {
  id: string;
  schemaVersion: string;
  type: string;
  authors: string[];
  title: string;
  year: string | number;
  publisher?: string;
  place?: string;
  edition?: string;
  isbn?: string;
  url?: string;
}

export interface Unit {
  meta: UnitMeta;
  stations: Station[];
}
