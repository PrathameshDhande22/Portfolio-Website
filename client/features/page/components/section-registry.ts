import type { ComponentType } from "react";
import { SkillsSection } from "@/features/skills/components/skills-section";
import { createTimelineSection } from "@/features/timeline/components/timeline-section";
import { ProjectsSection } from "@/features/projects/components/projects-section";
import { CertificationsSection } from "@/features/certifications/components/certifications-section";
import type { SectionBlock, SectionType } from "@/types/components";

export type SectionComponent = ComponentType<{ section: SectionBlock }>;

export const SECTION_REGISTRY: Partial<Record<SectionType, SectionComponent>> = {
  Skills: SkillsSection,
  Timeline: createTimelineSection("Timeline"),
  Experience: createTimelineSection("Experience"),
  Educations: createTimelineSection("Educations"),
  Projects: ProjectsSection,
  Certifications: CertificationsSection,
};
