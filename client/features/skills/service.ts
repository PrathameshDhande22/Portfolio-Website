import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { SkillCategory } from "@/types/content";

export async function getSkillCategories(documentIds?: string[]): Promise<SkillCategory[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.skills);

  const response = await strapiClient()
    .collection(ENDPOINT.skillCategories)
    .find({
      filters: documentIds?.length
        ? { documentId: { $in: documentIds } }
        : { Visible: { $eq: true } },
      populate: { Skills: { populate: "*" } },
      sort: ["Order:asc"],
      pagination: { pageSize: 100 },
    });

  return response.data as unknown as SkillCategory[];
}
