import { defineField, defineType } from "sanity";
import { TOPIC_OPTIONS, DIFFICULTY_OPTIONS, BOOK_TYPE_OPTIONS } from "@/lib/ressourcen";

export default defineType({
  name: "bookRecommendation",
  title: "Buchempfehlung",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", title: "Autor(en)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Jahr", type: "number" }),
    defineField({ name: "coverImage", title: "Cover", type: "image", options: { hotspot: true } }),
    defineField({
      name: "description",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Schwierigkeitsgrad",
      type: "string",
      options: {
        list: [...DIFFICULTY_OPTIONS],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "topics",
      title: "Themen",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [...TOPIC_OPTIONS],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "bookType",
      title: "Buchtyp",
      type: "string",
      options: {
        list: [...BOOK_TYPE_OPTIONS],
        layout: "radio",
      },
    }),
    defineField({ name: "buyLink", title: "Kauflink", type: "url" }),
    defineField({
      name: "reviewSlug",
      title: "Rezensions-Artikel (Slug)",
      type: "string",
      description: "Slug des Blog-Artikels, der eine Rezension dieses Buches enthält (z. B. 'meine-rezension-zu-x').",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "coverImage" },
  },
});
