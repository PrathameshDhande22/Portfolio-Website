import ReactMarkdown from "react-markdown";
import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
import remarkCallout from "remark-obsidian-callout";
import rehypeKatex from "rehype-katex";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { ARTICLE_COMPONENTS, PROSE_COMPONENTS } from "./markdown-components";
import { highlighterFor, SHIKI_THEMES } from "@/lib/highlighter";
import { normaliseCodeFences, remarkHighlight, remarkWikiLink } from "@/lib/markdown";

export { headingSlug, toPlainText } from "./markdown-components";

const REMARK = [remarkFrontmatter, remarkGfm, remarkMath, remarkCallout, remarkWikiLink, remarkHighlight];

interface MarkdownProps {
  content: string | null | undefined;
  variant?: "prose" | "article";
  className?: string;
}

export async function Markdown({ content, variant = "prose", className }: MarkdownProps) {
  "use cache";

  if (!content) return null;

  const isArticle = variant === "article";
  const source = normaliseCodeFences(content);
  const highlighter = isArticle ? await highlighterFor(source) : null;

  const rehype: PluggableList = highlighter
    ? [rehypeKatex, [rehypeShikiFromHighlighter, highlighter, { themes: SHIKI_THEMES, fallbackLanguage: "text" }]]
    : [rehypeKatex];

  return (
    <div className={`max-w-[68ch] text-[1rem] leading-[1.75] text-ink-2 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={REMARK}
        rehypePlugins={rehype}
        components={isArticle ? ARTICLE_COMPONENTS : PROSE_COMPONENTS}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
