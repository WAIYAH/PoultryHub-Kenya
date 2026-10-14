import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

import type { MdBlock, MdInline } from "@/lib/markdown";
import { cn } from "@/lib/utils";

const link = "font-semibold text-forest-700 underline underline-offset-4 hover:text-forest-900";

function Inline({ nodes }: { nodes: MdInline[] }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return <Fragment key={index}>{node.text}</Fragment>;
      case "strong":
        return (
          <strong key={index} className="font-semibold text-ink-900">
            <Inline nodes={node.children} />
          </strong>
        );
      case "em":
        return (
          <em key={index}>
            <Inline nodes={node.children} />
          </em>
        );
      case "del":
        return (
          <del key={index}>
            <Inline nodes={node.children} />
          </del>
        );
      case "code":
        return (
          <code
            key={index}
            className="rounded-sm bg-cream-100 px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {node.text}
          </code>
        );
      case "br":
        return <br key={index} />;
      case "link":
        // Same-site paths use the router; anything else opens in a new tab.
        return node.href.startsWith("/") || node.href.startsWith("#") ? (
          <Link key={index} to={node.href} className={link}>
            <Inline nodes={node.children} />
          </Link>
        ) : (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className={link}
          >
            <Inline nodes={node.children} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
    }
  });
}

function Blocks({ nodes }: { nodes: MdBlock[] }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "heading": {
        const Heading = `h${node.level}` as const;
        return (
          <Heading
            key={index}
            className={cn(
              "text-ink-900",
              node.level === 2 ? "mt-4 text-h3" : "mt-2 text-lg font-bold",
            )}
          >
            <Inline nodes={node.children} />
          </Heading>
        );
      }
      case "paragraph":
        return (
          <p key={index}>
            <Inline nodes={node.children} />
          </p>
        );
      case "inline":
        return <Inline key={index} nodes={node.children} />;
      case "list": {
        const List = node.ordered ? "ol" : "ul";
        return (
          <List
            key={index}
            start={node.ordered && node.start !== 1 ? node.start : undefined}
            className={cn("flex flex-col gap-2 pl-6", node.ordered ? "list-decimal" : "list-disc")}
          >
            {node.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-1 marker:text-forest-700">
                <Blocks nodes={item} />
              </li>
            ))}
          </List>
        );
      }
      case "blockquote":
        return (
          <blockquote key={index} className="border-l-4 border-forest-200 pl-4 text-ink-700 italic">
            <Blocks nodes={node.children} />
          </blockquote>
        );
      case "code":
        return (
          <pre
            key={index}
            className="overflow-x-auto rounded-md bg-cream-100 p-4 font-mono text-sm text-ink-900"
          >
            <code>{node.text}</code>
          </pre>
        );
      case "hr":
        return <hr key={index} className="border-line" />;
      case "table":
        return <Table key={index} node={node} />;
    }
  });
}

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;

function plainText(nodes: MdInline[]): string {
  return nodes
    .map((node) =>
      node.type === "text" || node.type === "code"
        ? node.text
        : node.type === "br"
          ? " "
          : plainText(node.children),
    )
    .join("");
}

/**
 * A Markdown table, styled like the product specifications. Wide tables scroll sideways inside
 * their own box (never the page, NFR-COMP-2); the box takes focus so keyboards can scroll it.
 */
function Table({ node }: { node: Extract<MdBlock, { type: "table" }> }) {
  const align = (column: number) => {
    const value = node.align[column];
    return value ? ALIGN[value] : "text-left";
  };
  return (
    <div
      role="region"
      aria-label={`Table: ${node.header.map(plainText).join(", ")}`}
      // A scrolling region must be keyboard reachable (WCAG 2.1.1, axe scrollable-region-focusable).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="overflow-x-auto rounded-lg bg-white shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {node.header.map((cell, column) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  "px-4 py-3 font-semibold whitespace-nowrap text-ink-900",
                  align(column),
                )}
              >
                <Inline nodes={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {node.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, column) => (
                <td key={column} className={cn("px-4 py-3 text-ink-700", align(column))}>
                  <Inline nodes={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Article and policy text (DESIGN_SYSTEM.md §9.2 Prose), from the JSON tree made by
 * `markdownToBlocks`. Plain React elements only: no HTML strings are ever rendered.
 */
export function Prose({ blocks, className }: { blocks: MdBlock[]; className?: string }) {
  return (
    <div
      className={cn(
        "flex max-w-prose flex-col gap-4 text-base leading-relaxed text-ink-700",
        className,
      )}
    >
      <Blocks nodes={blocks} />
    </div>
  );
}
