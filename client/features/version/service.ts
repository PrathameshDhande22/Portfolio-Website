import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { Version } from "@/types/content";

export async function getVersions(): Promise<Version[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.versions);

  const response = await strapiClient()
    .collection(ENDPOINT.versions)
    .find({ sort: ["createdAt:desc"], pagination: { pageSize: 100 } });

  return response.data as Version[];
}
