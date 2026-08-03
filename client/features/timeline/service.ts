import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { SectionBlock, TimeLineEntry } from "@/types/components";

const ENTRY_POPULATE = { populate: { Badges: { populate: { Skill: true } } } };

const SOURCES = {
  Timeline: {
    endpoint: ENDPOINT.timeLines,
    field: "Timeline",
    relation: "Timelines",
    tag: CACHE_TAG.timelines,
  },
  Experience: {
    endpoint: ENDPOINT.experiences,
    field: "Experience",
    relation: "Experiences",
    tag: CACHE_TAG.experiences,
  },
  Educations: {
    endpoint: ENDPOINT.educations,
    field: "Timeline",
    relation: "Educations",
    tag: CACHE_TAG.educations,
  },
} satisfies Record<string, { endpoint: string; field: string; relation: keyof SectionBlock; tag: string }>;

export type TimelineSectionType = keyof typeof SOURCES;

export function selectedDocumentIds(type: TimelineSectionType, section: SectionBlock): string[] {
  const items = section[SOURCES[type].relation] as { documentId: string }[] | null;
  return (items ?? []).map((item) => item.documentId);
}

export async function getTimelineEntries(
  type: TimelineSectionType,
  documentIds?: string[]
): Promise<TimeLineEntry[]> {
  "use cache";
  cacheLife("hours");

  const source = SOURCES[type];
  cacheTag(source.tag);

  const response = await strapiClient()
    .collection(source.endpoint)
    .find({
      filters: documentIds?.length ? { documentId: { $in: documentIds } } : undefined,
      populate: { [source.field]: ENTRY_POPULATE },
      pagination: { pageSize: 100 },
    });

  return (response.data as unknown as Record<string, TimeLineEntry>[])
    .map((item) => item[source.field])
    .filter(Boolean);
}
