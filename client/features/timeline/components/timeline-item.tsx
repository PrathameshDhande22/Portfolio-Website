import { Markdown } from "@/features/shared/components/markdown";
import { Reveal } from "@/features/shared/components/reveal";
import { TagList } from "@/features/shared/components/tag-list";
import type { TimeLineEntry } from "@/types/components";

export function TimelineItem({ entry }: { entry: TimeLineEntry }) {
  const tags = [...(entry.Badges ?? [])]
    .sort((a, b) => a.Order - b.Order)
    .filter((badge) => badge.Skill)
    .map((badge) => ({ id: badge.id, label: badge.Skill!.Name, highlight: badge.Highlight }));

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
      <TagList tags={tags} className="mt-3" />
    </Reveal>
  );
}
