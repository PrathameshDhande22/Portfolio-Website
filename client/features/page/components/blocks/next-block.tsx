import { SectionLabel } from "@/features/shared/components/section-label";
import { Markdown } from "@/features/shared/components/markdown";
import { CmsButton } from "@/features/shared/components/cms-button";
import type { NextBlock as NextBlockData } from "@/types/components";

export function NextBlock({ blocks }: { blocks: NextBlockData[] }) {
  const block = blocks[0];
  if (!block) return null;

  return (
    <div>
      {block.Divider ? <SectionLabel left={block.Divider.LeftText} right={block.Divider.RightText} /> : null}
      {block.Text ? (
        <p className="max-w-[64ch] text-[1rem] leading-[1.75] text-ink-2">{block.Text}</p>
      ) : null}
      <Markdown content={block.Description} />
      {block.Button.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-[0.6rem]">
          {block.Button.map((button) => (
            <CmsButton key={button.id} button={button} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
