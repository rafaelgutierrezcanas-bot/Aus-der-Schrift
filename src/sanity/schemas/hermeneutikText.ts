import { defineType, defineField } from "sanity";

export default defineType({
  name: "hermeneutikText",
  title: "Hermeneutik-Text",
  type: "document",
  fields: [
    defineField({
      name: "titleDe",
      title: "Titel (Deutsch)",
      type: "string",
      description: "z.B. '1. Thessalonicher 1,1-10'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      description: "e.g. '1 Thessalonians 1:1-10'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleEn", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bibleReference",
      title: "Bibelstelle (kurz)",
      type: "string",
      description: "z.B. '1Thess 1,1-10'",
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "string",
      options: {
        list: [
          { title: "Epistel", value: "epistle" },
          { title: "Narrativ", value: "narrative" },
          { title: "Poesie", value: "poetry" },
          { title: "Prophetie", value: "prophecy" },
          { title: "Weisheit", value: "wisdom" },
          { title: "Apokalyptik", value: "apocalyptic" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Schwierigkeit",
      type: "string",
      options: {
        list: [
          { title: "Einsteiger", value: "beginner" },
          { title: "Fortgeschritten", value: "intermediate" },
          { title: "Experte", value: "advanced" },
        ],
      },
      initialValue: "beginner",
    }),
    defineField({
      name: "order",
      title: "Empfohlene Reihenfolge",
      type: "number",
      description: "Sortierung in der Textauswahl",
    }),
    defineField({
      name: "textContentDe",
      title: "Bibeltext (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Der vollständige Bibeltext (z.B. Elberfelder)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "textContentEn",
      title: "Bible Text (English)",
      type: "array",
      of: [{ type: "block" }],
      description: "Full Bible text (e.g. ESV)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "backgroundInfoDe",
      title: "Hintergrundinformationen (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Historischer Kontext, Einleitungsfragen — wird in Schritt 2 angezeigt",
    }),
    defineField({
      name: "backgroundInfoEn",
      title: "Background Information (English)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "stepAnalyses",
      title: "Schritt-Analysen",
      type: "array",
      of: [
        {
          type: "object",
          name: "stepAnalysis",
          title: "Schritt-Analyse",
          fields: [
            defineField({
              name: "step",
              title: "Schritt",
              type: "reference",
              to: [{ type: "hermeneutikSchritt" }],
              validation: (r) => r.required(),
            }),
            defineField({
              name: "expertAnalysisDe",
              title: "Musteranalyse (Deutsch)",
              type: "array",
              of: [{ type: "block" }],
              description: "Die Experten-Musterlösung für diesen Schritt",
            }),
            defineField({
              name: "expertAnalysisEn",
              title: "Expert Analysis (English)",
              type: "array",
              of: [{ type: "block" }],
            }),
            defineField({
              name: "hintsDe",
              title: "Hinweise (Deutsch)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "hintsEn",
              title: "Hints (English)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "interactionData",
              title: "Interaktionsdaten (JSON)",
              type: "text",
              description: "JSON: MC-Optionen, korrekte Markierungen, etc. Format: { options: [...], correct: [...] }",
            }),
          ],
          preview: {
            select: { title: "step.titleDe", order: "step.order" },
            prepare({ title, order }) {
              return { title: `${order || "?"}: ${title || "Schritt"}` };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "titleDe", genre: "genre", difficulty: "difficulty" },
    prepare({ title, genre, difficulty }) {
      return {
        title,
        subtitle: `${genre || "?"} · ${difficulty || "?"}`,
      };
    },
  },
});
