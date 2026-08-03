export interface TagItem {
  id: number | string;
  label: string;
  highlight?: boolean;
}

export function TagList({ tags, className }: { tags: TagItem[]; className?: string }) {
  if (tags.length === 0) return null;

  return (
    <ul className={`m-0 flex list-none flex-wrap gap-[0.35rem] p-0 ${className ?? ""}`}>
      {tags.map((tag) => (
        <li
          key={tag.id}
          className={`rounded-full border px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium whitespace-nowrap transition-colors ${
            tag.highlight
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"
          }`}
        >
          {tag.label}
        </li>
      ))}
    </ul>
  );
}
