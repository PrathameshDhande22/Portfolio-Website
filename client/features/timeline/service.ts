import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { TimeLine } from "@/types/content";

const ENTRY_POPULATE = { populate: { Badges: { populate: { Skill: true } } } };

export async function getTimelines(documentIds?: string[]): Promise<TimeLine[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.timelines);

  const response = await strapiClient()
    .collection(ENDPOINT.timeLines)
    .find({
      filters: documentIds?.length ? { documentId: { $in: documentIds } } : undefined,
      populate: { Timeline: ENTRY_POPULATE },
      pagination: { pageSize: 100 },
    });

  return response.data as unknown as TimeLine[];
}
