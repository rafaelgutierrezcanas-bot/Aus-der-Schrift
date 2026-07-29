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
  estimatedMinutes?: number;
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

// Typed content interfaces for specific station types

export interface VorverstaendnisQuestion {
  id: string;
  prompt: string;
  inputType: "auswahl" | "freitext" | "mehrfachauswahl";
  options?: { id: string; label: string }[];
  required: boolean;
}

export interface DistanceItem {
  category: string;
  phrase: string;
  explanation: string;
  translations?: { text: string; sigel: string }[];
}

export interface BracketData {
  answers: Record<string, string | string[]>;
  date: string;
}

export interface VorverstaendnisContent {
  intro: string;
  scripture: {
    reference: string;
    translation: string;
    verses: { number: number; text: string }[];
  };
  questions: VorverstaendnisQuestion[];
  resolution: {
    whatYouBring: {
      blocks: string[];
      footnotes: { number: number; sourceId: string; pages: string }[];
    };
    quote: {
      text: string;
      sourceId: string;
      pages: string;
    };
    transition: string;
    distance: {
      selfTestQuestionId: string;
      items: DistanceItem[];
    };
    prediction: VorverstaendnisQuestion;
    synthesis: string;
  };
  navigation?: {
    prev?: { label: string; href: string };
    next?: { label: string; href: string };
  };
}
