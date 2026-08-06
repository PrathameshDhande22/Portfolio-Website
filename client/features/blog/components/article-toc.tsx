import { headingSlug } from "@/features/shared/components/markdown";

const HEADING = /^#{1,3}\s+(.+?)\s*#*$/gm;

export function ArticleToc({ markdown }: { markdown: string | null | undefined }) {
  if (!markdown) return null;

  const headings = [...markdown.matchAll(HEADING)].map((match) => match[1].trim());
  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden self-start nav:block">
      <p className="mb-3 text-[0.72rem] font-semibold tracking-widest text-ink-3 uppercase">On this page</p>
      <ol className="m-0 list-none space-y-2 p-0">
        {headings.map((heading) => (
          <li key={heading}>
            <a
              href={`#${headingSlug(heading)}`}
              className="block text-[0.82rem] leading-[1.45] text-ink-2 no-underline transition-colors hover:text-accent"
            >
              {heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
