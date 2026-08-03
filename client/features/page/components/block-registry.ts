import type { ComponentType } from "react";
import type { PageBlock, PageBlockName } from "@/types/components";
import { HeroBlock } from "./blocks/hero-block";
import { NextBlock } from "./blocks/next-block";
import { LinkBlock } from "./blocks/link-block";
import { SocialLinksBlock } from "./blocks/social-links-block";
import { SectionBlock } from "./blocks/section-block";

type BlockOf<K extends PageBlockName> = Extract<PageBlock, { __component: K }>;

export type BlockRegistry = {
  [K in PageBlockName]?: ComponentType<{ blocks: BlockOf<K>[] }>;
};

export const BLOCK_REGISTRY: BlockRegistry = {
  "shared.hero": HeroBlock,
  "shared.next": NextBlock,
  "shared.links": LinkBlock,
  "home.social-links": SocialLinksBlock,
  "section.skills": SectionBlock,
};
