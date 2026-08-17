import { defineField, defineType } from "sanity";
import { linkAnnotations } from "./fields";

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
      of: [{ type: "block", marks: { annotations: linkAnnotations } }],
    }),
    defineField({
      name: "bodyEn",
      title: "Content (EN)",
      type: "array",
      of: [{ type: "block", marks: { annotations: linkAnnotations } }],
    }),
  ],
  preview: {
    select: { title: "titleDe", subtitle: "slug.current" },
  },
});
