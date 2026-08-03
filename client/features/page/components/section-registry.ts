import type { ComponentType } from "react";
import type { SectionBlock, SectionType } from "@/types/components";

export type SectionComponent = ComponentType<{ section: SectionBlock }>;

export const SECTION_REGISTRY: Partial<Record<SectionType, SectionComponent>> = {};
