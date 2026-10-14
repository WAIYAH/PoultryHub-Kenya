import { Lexer, type Token, type Tokens } from "marked";

// Markdown for blog posts and policies (CNT-03, SITE-09), turned into a small JSON tree that the
// Prose component renders with plain React elements. Pre-rendered pages convert at build time in
// their loader, so the parser never reaches the browser (NFR-PERF-3); pages loaded in the browser
// import this module on demand. Raw HTML is dropped and only safe link targets are kept
// (NFR-SEC-5): content never becomes markup.

export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong" | "em" | "del"; children: MdInline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: MdInline[] }
  | { type: "br" };

export type MdBlock =
  | { type: "heading"; level: 2 | 3 | 4; children: MdInline[] }
  | { type: "paragraph"; children: MdInline[] }
  /** A tight list item's text, rendered without a <p>. */
  | { type: "inline"; children: MdInline[] }
  | { type: "list"; ordered: boolean; start: number; items: MdBlock[][] }
  | { type: "blockquote"; children: MdBlock[] }
  | { type: "code"; text: string }
  | { type: "hr" };

/** Same-site paths and anchors, web links, email and phone links. Anything else becomes text. */
export function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^\/(?![/\\])/.test(trimmed) || trimmed.startsWith("#")) return trimmed;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return null;
}

function inline(tokens: Token[] | undefined): MdInline[] {
  const result: MdInline[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape": {
        const text = token as Tokens.Text;
        if (text.tokens?.length) result.push(...inline(text.tokens));
        else result.push({ type: "text", text: text.text });
        break;
      }
      case "strong":
      case "em":
      case "del":
        result.push({ type: token.type, children: inline((token as Tokens.Strong).tokens) });
        break;
      case "codespan":
        result.push({ type: "code", text: (token as Tokens.Codespan).text });
        break;
      case "br":
        result.push({ type: "br" });
        break;
      case "link": {
        const link = token as Tokens.Link;
        const href = safeHref(link.href);
        const children = inline(link.tokens);
        if (href) result.push({ type: "link", href, children });
        else result.push(...children);
        break;
      }
      case "image": {
        // No images in Markdown bodies yet: keep the description so nothing is silently lost.
        const image = token as Tokens.Image;
        if (image.text) result.push({ type: "text", text: image.text });
        break;
      }
      default:
        // "html" and anything unexpected: dropped, never rendered as markup.
        break;
    }
  }
  return result;
}

function blocks(tokens: Token[]): MdBlock[] {
  const result: MdBlock[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const heading = token as Tokens.Heading;
        // The page title is the only h1; Markdown headings start at h2.
        const level = Math.min(Math.max(heading.depth, 2), 4) as 2 | 3 | 4;
        result.push({ type: "heading", level, children: inline(heading.tokens) });
        break;
      }
      case "paragraph":
        result.push({ type: "paragraph", children: inline((token as Tokens.Paragraph).tokens) });
        break;
      case "text": {
        const text = token as Tokens.Text;
        result.push({
          type: "inline",
          children: text.tokens ? inline(text.tokens) : [{ type: "text", text: text.text }],
        });
        break;
      }
      case "list": {
        const list = token as Tokens.List;
        result.push({
          type: "list",
          ordered: list.ordered,
          start: typeof list.start === "number" ? list.start : 1,
          items: list.items.map((item) => blocks(item.tokens)),
        });
        break;
      }
      case "blockquote":
        result.push({ type: "blockquote", children: blocks((token as Tokens.Blockquote).tokens) });
        break;
      case "code":
        result.push({ type: "code", text: (token as Tokens.Code).text });
        break;
      case "hr":
        result.push({ type: "hr" });
        break;
      default:
        // "space", "html", tables and anything unexpected are left out.
        break;
    }
  }
  return result;
}

/** Markdown → a JSON-serialisable tree for <Prose>. */
export function markdownToBlocks(markdown: string): MdBlock[] {
  return blocks(Lexer.lex(markdown));
}
