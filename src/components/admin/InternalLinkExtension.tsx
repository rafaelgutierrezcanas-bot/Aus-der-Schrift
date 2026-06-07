"use client";
import { Mark, mergeAttributes } from "@tiptap/core";

export const InternalLinkExtension = Mark.create({
  name: "internalLink",

  addAttributes() {
    return {
      slug: { default: "" },
      titleDe: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="internalLink"]',
        getAttrs: (el) => ({
          slug: (el as HTMLElement).dataset.slug ?? "",
          titleDe: (el as HTMLElement).dataset.titleDe ?? "",
        }),
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-type": "internalLink",
        "data-slug": mark.attrs.slug,
        "data-title-de": mark.attrs.titleDe,
        href: `/de/${mark.attrs.slug}`,
        style: "color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px;",
      }),
      0,
    ];
  },
});
