import type { Hero } from "@/types/components";

export function HeroBlock({ blocks }: { blocks: Hero[] }) {
  const block = blocks[0];
  if (!block) return null;

  return (
    <div>
      <h1 className="mb-[0.7rem] font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
        {block.Title}
      </h1>
      <p className="mb-7 max-w-[58ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-ink-2">
        {block.Description}
      </p>
      {block.AdditionalText ? (
        <p className="max-w-[64ch] text-[1rem] leading-[1.75] text-ink-2">{block.AdditionalText}</p>
      ) : null}
    </div>
  );
}
