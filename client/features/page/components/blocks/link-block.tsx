import { LinkOut } from "@/features/shared/components/link-out";
import type { LinkItem } from "@/types/components";

export function LinkBlock({ blocks }: { blocks: LinkItem[] }) {
  const block = blocks[0];
  if (!block) return null;

  return (
    <div className="flex flex-col gap-2">
      {block.Title && block.Title !== block.Text ? (
        <p className="text-[0.82rem] text-ink-3">{block.Title}</p>
      ) : null}
      <LinkOut link={block} />
    </div>
  );
}
