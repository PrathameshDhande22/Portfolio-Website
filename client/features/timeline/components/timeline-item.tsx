import { Markdown } from "@/features/shared/components/markdown";
import { Reveal } from "@/features/shared/components/reveal";
import type { TimeLineEntry } from "@/types/components";

export function TimelineItem({ entry }: { entry: TimeLineEntry }) {
  const badges = [...entry.Badges].sort((a, b) => a.Order - b.Order);

  return (
    <Reveal
      from="left"
      className="relative pb-8 before:absolute before:top-[0.55rem] before:-left-7 before:size-1.75 before:rounded-full before:bg-accent before:content-['']"
    >
      {entry.ShortTitle ? (
        <div className="text-[0.82rem] font-semibold text-accent">{entry.ShortTitle}</div>
      ) : null}
      <h3 className="mt-1 mb-[0.35rem] font-display text-[1.2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
        {entry.Title}
      </h3>
      {entry.SubTitle ? (
        <div className="mb-[0.7rem] text-[0.8rem] font-medium text-ink-3">{entry.SubTitle}</div>
      ) : null}
      <Markdown content={entry.Description} className="max-w-[62ch]" />
      {badges.length > 0 ? (
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-[0.35rem] p-0">
          {badges.map((badge) => (
            <li
              key={badge.id}
              className={`rounded-full border px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium whitespace-nowrap transition-colors ${
                badge.Highlight
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {badge.Skill?.Name}
            </li>
          ))}
        </ul>
      ) : null}
    </Reveal>
  );
}
