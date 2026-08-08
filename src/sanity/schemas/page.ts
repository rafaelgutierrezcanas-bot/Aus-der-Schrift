import { defineField, defineType } from "sanity";

export default defineType({
  name: "page",
  title: "Seite",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Eindeutiger Bezeichner (z.B. 'zu-meiner-person', 'impressum')",
      validation: (r) => r.required(),
    }),
    defineField({ name: "titleDe", title: "Titel (DE)", type: "string" }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string" }),
    defineField({
      name: "bodyDe",
      title: "Inhalt (DE)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "bodyEn",
      title: "Content (EN)",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "titleDe", subtitle: "slug.current" },
  },
});
