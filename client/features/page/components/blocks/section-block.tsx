import { SECTION_REGISTRY } from "../section-registry";
import type { SectionBlock as SectionBlockData } from "@/types/components";

export function SectionBlock({ blocks }: { blocks: SectionBlockData[] }) {
  const section = blocks[0];
  if (!section) return null;

  const Component = SECTION_REGISTRY[section.Type];
  if (!Component) return null;

  return <Component section={section} />;
}
