import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "image", title: "Bild", type: "image" }),
  ],
});
