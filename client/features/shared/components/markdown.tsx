import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function headingSlug(children: ReactNode): string {
  return toPlainText(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toPlainText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(toPlainText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return toPlainText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

const proseComponents: Components = {
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-4 list-disc pl-[1.1rem] marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-[1.1rem] marker:text-accent">{children}</ol>,
  li: ({ children }) => <li className="mb-1.5">{children}</li>,
  code: ({ children }) => (
    <code className="rounded-[5px] bg-surface-2 px-[0.35em] py-[0.12em] font-mono text-[0.86em]">{children}</code>
  ),
};

const articleComponents: Components = {
  ...proseComponents,
  h2: ({ children }) => (
    <h2
      id={headingSlug(children)}
      className="mt-9 mb-3 scroll-mt-6 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-display text-[1.1rem] font-semibold tracking-[-0.02em] text-ink">{children}</h3>
  ),
  ul: ({ children }) => <ul className="mb-4 list-disc pl-5 marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-5 marker:text-accent">{children}</ol>,
  li: ({ children }) => <li className="mb-1.5">{children}</li>,
  hr: () => <hr className="my-8 border-0 border-t border-line" />,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-accent pl-4 text-ink-2 italic">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-5 overflow-x-auto rounded-tile bg-slab px-[1.15rem] py-4 font-mono text-[0.84rem] leading-[1.6] text-slab-fg">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.9rem]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line px-3 py-2 font-semibold text-ink">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2">{children}</td>,
};

interface MarkdownProps {
  content: string | null | undefined;
  variant?: "prose" | "article";
  className?: string;
}

export function Markdown({ content, variant = "prose", className }: MarkdownProps) {
  if (!content) return null;

  const isArticle = variant === "article";

  return (
    <div
      className={[
        isArticle ? "max-w-[68ch] text-[1rem] leading-[1.75]" : "max-w-[64ch] text-[1rem] leading-[1.75]",
        "text-ink-2",
        className ?? "",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={isArticle ? [rehypeHighlight] : []}
        components={isArticle ? articleComponents : proseComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
