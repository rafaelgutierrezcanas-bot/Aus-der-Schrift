import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "titleDe", title: "Titel (DE)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleEn", title: "Title (EN)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "titleDe" }, validation: (r) => r.required() }),
    defineField({ name: "descriptionDe", title: "Beschreibung (DE)", type: "text" }),
    defineField({ name: "descriptionEn", title: "Description (EN)", type: "text" }),
  ],
});
