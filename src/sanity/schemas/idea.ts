import { defineField, defineType } from "sanity";

export default defineType({
  name: "idea",
  title: "Idee",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "notes", title: "Gedanken / Notizen", type: "text", rows: 5 }),
    defineField({
      name: "createdAt",
      title: "Erstellt am",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "notes" },
  },
});
