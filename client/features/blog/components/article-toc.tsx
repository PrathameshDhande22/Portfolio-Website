"use client";

import { useActiveHeading } from "../hooks/use-active-heading";

interface TocEntry {
  id: string;
  label: string;
}

export function ArticleToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveHeading(entries.map((entry) => entry.id));

  if (entries.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden self-start nav:block">
      <p className="mb-3 text-[0.72rem] font-semibold tracking-widest text-ink-3 uppercase">On this page</p>
      <ol className="m-0 list-none border-l border-line p-0">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === active ? "location" : undefined}
              className={`-ml-px block border-l py-1.5 pl-3 text-[0.82rem] leading-[1.45] no-underline transition-colors ${
                entry.id === active
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
