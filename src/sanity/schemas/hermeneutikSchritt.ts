import { defineType, defineField } from "sanity";

export default defineType({
  name: "hermeneutikSchritt",
  title: "Hermeneutik-Schritt",
  type: "document",
  fields: [
    defineField({
      name: "titleDe",
      title: "Titel (Deutsch)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
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
      name: "order",
      title: "Reihenfolge",
      type: "number",
      validation: (r) => r.required().min(1).max(6),
    }),
    defineField({
      name: "accentColor",
      title: "Akzentfarbe (hex)",
      type: "string",
      description: "z.B. #F59E0B für Amber",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon-Name",
      type: "string",
      description: "Lucide icon name, z.B. 'search', 'scroll-text', 'book-open'",
    }),
    defineField({
      name: "explanationDe",
      title: "Erklärung (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Was / Warum / Wie — ausführliche Erklärung des Schritts",
    }),
    defineField({
      name: "explanationEn",
      title: "Explanation (English)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "guidingQuestionsDe",
      title: "Leitfragen (Deutsch)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "guidingQuestionsEn",
      title: "Guiding Questions (English)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "commonMistakesDe",
      title: "Häufige Fehler (Deutsch)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "commonMistakesEn",
      title: "Common Mistakes (English)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "interactionType",
      title: "Interaktionstyp",
      type: "string",
      options: {
        list: [
          { title: "Freitext", value: "freetext" },
          { title: "Markierung im Text", value: "marking" },
          { title: "Multiple Choice", value: "multiplechoice" },
        ],
      },
    }),
    defineField({
      name: "sources",
      title: "Quellen (Buchverweise)",
      type: "array",
      of: [{ type: "string" }],
      description: "z.B. 'Osborne, Hermeneutical Spiral, Kap. 3'",
    }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "titleDe", order: "order" },
    prepare({ title, order }) {
      return { title: `${order}. ${title}` };
    },
  },
});
