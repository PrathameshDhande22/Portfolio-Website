import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "./code-block";

export function toPlainText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(toPlainText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return toPlainText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function headingSlug(children: ReactNode): string {
  return toPlainText(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const HEADING = "font-display font-semibold tracking-[-0.02em] text-ink";

function Anchored({ children, className }: { children: ReactNode; className: string }) {
  return (
    <h2 id={headingSlug(children)} className={`scroll-mt-24 ${className}`}>
      {children}
    </h2>
  );
}

export const PROSE_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  mark: ({ children }) => <mark className="rounded bg-accent-soft px-1 text-ink">{children}</mark>,
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-4 list-disc pl-5 marker:text-accent">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-5 marker:text-accent">{children}</ol>,
  li: ({ children }) => <li className="mb-1.5">{children}</li>,
  code: ({ children }) => (
    <code className="rounded-[5px] bg-surface-2 px-[0.35em] py-[0.12em] font-mono text-[0.86em]">{children}</code>
  ),
};

export const ARTICLE_COMPONENTS: Components = {
  ...PROSE_COMPONENTS,
  h1: ({ children }) => <Anchored className={`mt-9 mb-3 text-[1.35rem] first:mt-0 ${HEADING}`}>{children}</Anchored>,
  h2: ({ children }) => <Anchored className={`mt-9 mb-3 text-[1.35rem] first:mt-0 ${HEADING}`}>{children}</Anchored>,
  h3: ({ children }) => <h3 className={`mt-6 mb-2 text-[1.1rem] ${HEADING}`}>{children}</h3>,
  hr: () => <hr className="my-8 border-0 border-t border-line" />,
  pre: ({ children, className, style }) => (
    <CodeBlock className={className} style={style}>
      {children}
    </CodeBlock>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="my-6 rounded-r-tile border-l-2 border-accent bg-surface-2/60 py-3 pr-4 pl-4 text-ink-2"
    >
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.9rem]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line px-3 py-2 font-semibold text-ink">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2">{children}</td>,
  input: ({ checked, type }) =>
    type === "checkbox" ? (
      <input type="checkbox" checked={checked} readOnly className="mr-2 accent-accent" />
    ) : null,
};
