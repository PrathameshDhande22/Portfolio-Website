import type { ComponentType } from "react";
import { SectionLabel } from "@/features/shared/components/section-label";
import { BLOCK_REGISTRY } from "./block-registry";
import type { Divider, PageBlock } from "@/types/components";

const DIVIDER_BLOCK = "shared.badge";
const REPEATABLE_BLOCKS = new Set(["home.social-links"]);

interface BlockGroup {
  divider: Divider | null;
  blocks: PageBlock[];
}

function groupBlocks(content: PageBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];

  for (const block of content) {
    if (block.__component === DIVIDER_BLOCK) {
      groups.push({ divider: block, blocks: [] });
      continue;
    }

    const open = groups.at(-1);
    const dividerNeedsBlock = open?.blocks.length === 0;
    const continuesList =
      REPEATABLE_BLOCKS.has(block.__component) && open?.blocks[0]?.__component === block.__component;

    if (open && (dividerNeedsBlock || continuesList)) open.blocks.push(block);
    else groups.push({ divider: null, blocks: [block] });
  }

  return groups;
}

export function BlockRenderer({ content }: { content: PageBlock[] }) {
  return groupBlocks(content).map(({ divider, blocks }) => {
    const [first] = blocks;
    const Block = first
      ? (BLOCK_REGISTRY[first.__component] as ComponentType<{ blocks: PageBlock[] }> | undefined)
      : undefined;

    if (!divider && !Block) return null;

    return (
      <section
        key={divider ? `divider-${divider.id}` : `block-${first.id}`}
        className="border-t border-line py-[clamp(2.25rem,4.5vw,3.25rem)] first:border-t-0"
      >
        {divider ? <SectionLabel left={divider.LeftText} right={divider.RightText} /> : null}
        {Block ? <Block blocks={blocks} /> : null}
      </section>
    );
  });
}
