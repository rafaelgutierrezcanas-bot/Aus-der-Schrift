"use client";
import { Mark, mergeAttributes } from "@tiptap/core";

export const InfoCardExtension = Mark.create({
  name: "infocard",

  addAttributes() {
    return {
      explanation: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="infocard"]',
        getAttrs: (el) => ({
          explanation: (el as HTMLElement).dataset.explanation ?? "",
        }),
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "infocard",
        "data-explanation": mark.attrs.explanation,
        style:
          "text-decoration: underline dotted #C4933A; cursor: help; text-underline-offset: 3px;",
        title: mark.attrs.explanation,
      }),
      0,
    ];
  },
});
