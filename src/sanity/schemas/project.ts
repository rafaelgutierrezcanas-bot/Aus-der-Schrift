import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Projekt / Reihe",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 3 }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Laufend", value: "laufend" },
          { title: "Abgeschlossen", value: "abgeschlossen" },
          { title: "Pausiert", value: "pausiert" },
        ],
        layout: "radio",
      },
      initialValue: "laufend",
    }),
    defineField({
      name: "startedAt",
      title: "Begonnen am",
      type: "date",
    }),
    defineField({
      name: "researchQuestionDe",
      title: "Leitfrage (DE)",
      type: "text",
      rows: 3,
      description: "Die zentrale Forschungsfrage auf Deutsch.",
    }),
    defineField({
      name: "researchQuestionEn",
      title: "Research Question (EN)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "plannedOutput",
      title: "Geplante Beiträge",
      type: "string",
      description: 'z.B. "3 Artikel, 1 Essay"',
    }),
    defineField({
      name: "titleEn",
      title: "Titel (EN)",
      type: "string",
    }),
    defineField({
      name: "descriptionEn",
      title: "Beschreibung (EN)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "isPublic",
      title: "Öffentlich sichtbar",
      type: "boolean",
      initialValue: true,
      description: "Wenn deaktiviert, erscheint das Projekt nicht auf der öffentlichen Seite.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
