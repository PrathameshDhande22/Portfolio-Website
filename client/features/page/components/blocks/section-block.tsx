import { SECTION_REGISTRY } from "../section-registry";
import type { SectionBlock as SectionBlockData } from "@/types/components";
import type { SearchParams } from "@/types/search-params";

interface SectionBlockProps {
  blocks: SectionBlockData[];
  searchParams?: SearchParams;
}

export function SectionBlock({ blocks, searchParams }: SectionBlockProps) {
  const section = blocks[0];
  if (!section) return null;

  const Component = SECTION_REGISTRY[section.Type];
  if (!Component) return null;

  return <Component section={section} searchParams={searchParams} />;
}
