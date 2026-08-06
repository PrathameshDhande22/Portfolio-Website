import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { Project } from "@/types/content";

export async function getProjects(documentIds?: string[]): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.projects);

  const response = await strapiClient()
    .collection(ENDPOINT.projects)
    .find({
      filters: documentIds?.length ? { documentId: { $in: documentIds } } : undefined,
      populate: {
        Thumbnail: true,
        Screenshots: true,
        Links: true,
        Tags: { populate: { Technology: true } },
      },
      sort: ["Order:asc"],
      pagination: { pageSize: 100 },
    });

  return response.data as Project[];
}
