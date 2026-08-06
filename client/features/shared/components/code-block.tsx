"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function CodeBlock({ children, className, style }: CodeBlockProps) {
  const code = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = code.current?.innerText ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <div className="group relative">
      <pre ref={code} className={className} style={style}>
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-md border border-line/40 bg-surface/80 text-ink-2 opacity-0 backdrop-blur transition-[opacity,color,border-color] duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:border-accent hover:text-accent"
      >
        {copied ? <LuCheck className="size-3.5 text-accent" /> : <LuCopy className="size-3.5" />}
      </button>
    </div>
  );
}
