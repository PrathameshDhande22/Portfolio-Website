import type { ComponentType } from "react";
import { SkillsSection } from "@/features/skills/components/skills-section";
import { TimelineSection } from "@/features/timeline/components/timeline-section";
import type { SectionBlock, SectionType } from "@/types/components";

export type SectionComponent = ComponentType<{ section: SectionBlock }>;

export const SECTION_REGISTRY: Partial<Record<SectionType, SectionComponent>> =
  {
    Skills: SkillsSection,
    Timeline: TimelineSection,
  };
