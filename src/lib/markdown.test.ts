import { describe, expect, it } from "vitest";

import { markdownToBlocks, safeHref } from "./markdown";

describe("markdownToBlocks", () => {
  it("converts headings, paragraphs, emphasis and links", () => {
    expect(markdownToBlocks("## Keep them cool\n\nA *fridge* is **best**. [Shop](/shop)")).toEqual([
      { type: "heading", level: 2, children: [{ type: "text", text: "Keep them cool" }] },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "A " },
          { type: "em", children: [{ type: "text", text: "fridge" }] },
          { type: "text", text: " is " },
          { type: "strong", children: [{ type: "text", text: "best" }] },
          { type: "text", text: ". " },
          { type: "link", href: "/shop", children: [{ type: "text", text: "Shop" }] },
        ],
      },
    ]);
  });

  it("keeps the page's only h1 by starting Markdown headings at h2", () => {
    expect(markdownToBlocks("# Title\n\n##### Deep")).toMatchObject([
      { type: "heading", level: 2 },
      { type: "heading", level: 4 },
    ]);
  });

  it("converts tight and numbered lists", () => {
    expect(markdownToBlocks("3. one\n4. **two**")).toEqual([
      {
        type: "list",
        ordered: true,
        start: 3,
        items: [
          [{ type: "inline", children: [{ type: "text", text: "one" }] }],
          [
            {
              type: "inline",
              children: [{ type: "strong", children: [{ type: "text", text: "two" }] }],
            },
          ],
        ],
      },
    ]);
  });

  it("drops raw HTML tags, keeping any text between them as plain text (NFR-SEC-5)", () => {
    expect(markdownToBlocks("Eggs & <b>chicks</b> <script>alert(1)</script>")).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Eggs & " },
          { type: "text", text: "chicks" },
          { type: "text", text: " " },
          { type: "text", text: "alert(1)" },
        ],
      },
    ]);
    expect(markdownToBlocks("<div>block html</div>")).toEqual([]);
  });

  it("turns unsafe links into plain text", () => {
    expect(markdownToBlocks("[click](javascript:alert(1)) [ok](https://example.com)")).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", text: "click" },
          { type: "text", text: " " },
          { type: "link", href: "https://example.com", children: [{ type: "text", text: "ok" }] },
        ],
      },
    ]);
  });
});

describe("safeHref", () => {
  it("allows site paths, anchors, web, email and phone links only", () => {
    for (const href of ["/shop", "#top", "https://wa.me/2547", "mailto:a@b.co", "tel:+254700"]) {
      expect(safeHref(href)).toBe(href);
    }
    for (const href of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "/\\evil"]) {
      expect(safeHref(href)).toBeNull();
    }
  });
});
