import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Reihe",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
    defineField({ name: "description", title: "Beschreibung", type: "text", rows: 3 }),
    defineField({ name: "descriptionEn", title: "Description (EN)", type: "text", rows: 3 }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
