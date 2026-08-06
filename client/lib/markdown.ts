import { visit } from "unist-util-visit";
import type { Root, Text, PhrasingContent } from "mdast";

const FENCE_BLOCK = /^([ \t]*)(```|~~~)([^\n]*)\n([\s\S]*?)\n[ \t]*\2[ \t]*$/gm;
const WIKI_LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const HIGHLIGHT = /==([^=]+)==/g;

export function normaliseCodeFences(markdown: string): string {
  return markdown.replace(FENCE_BLOCK, (_match, indent: string, fence: string, info: string, body: string) => {
    const lines = body.split("\n");
    const widths = lines.filter((line) => line.trim()).map((line) => line.match(/^[ \t]*/)![0].length);
    const common = widths.length > 0 ? Math.min(...widths) : 0;
    const cleaned = lines.map((line) => (line.trim() ? line.slice(common) : "")).join("\n");

    return `${indent}${fence}${info}\n${cleaned}\n${indent}${fence}`;
  });
}

function slugify(target: string): string {
  return target
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitTextNode(
  value: string,
  pattern: RegExp,
  build: (match: RegExpExecArray) => PhrasingContent
): PhrasingContent[] | null {
  pattern.lastIndex = 0;
  const parts: PhrasingContent[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) parts.push({ type: "text", value: value.slice(cursor, match.index) });
    parts.push(build(match));
    cursor = match.index + match[0].length;
  }

  if (parts.length === 0) return null;
  if (cursor < value.length) parts.push({ type: "text", value: value.slice(cursor) });

  return parts;
}

function replaceInText(tree: Root, pattern: RegExp, build: (match: RegExpExecArray) => PhrasingContent) {
  visit(tree, "text", (node: Text, index, parent) => {
    if (!parent || index === undefined || parent.type === "link") return;

    const parts = splitTextNode(node.value, pattern, build);
    if (!parts) return;

    parent.children.splice(index, 1, ...parts);
    return index + parts.length;
  });
}

export function remarkWikiLink() {
  return (tree: Root) =>
    replaceInText(tree, WIKI_LINK, (match) => ({
      type: "link",
      url: `/blog/${slugify(match[1])}`,
      children: [{ type: "text", value: (match[2] ?? match[1]).trim() }],
    }));
}

export function remarkHighlight() {
  return (tree: Root) =>
    replaceInText(tree, HIGHLIGHT, (match) => ({
      type: "emphasis",
      data: { hName: "mark" },
      children: [{ type: "text", value: match[1] }],
    }));
}
