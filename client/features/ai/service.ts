import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, SINGLE_ENDPOINT, strapiClient } from "@/features/shared/service";
import type { AiSettings } from "@/types/content";

export async function getAiSettings(): Promise<AiSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.aiSettings);

  const response = await strapiClient().single(SINGLE_ENDPOINT.aiSettings).find({ populate: "*" });

  return response.data as AiSettings;
}
