import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, SINGLE_ENDPOINT, strapiClient } from "@/features/shared/service";
import type { AiSettings, SiteSettings } from "@/types/content";

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.siteSettings);

  const response = await strapiClient()
    .single(SINGLE_ENDPOINT.siteSettings)
    .find({
      populate: {
        ProfileImage: true,
        Favicon: true,
        AskAI: true,
        Navigation: { populate: { Page: true } },
        SocialLinks: true,
        Footer: true,
      },
    });

  return response.data as unknown as SiteSettings;
}

export async function getAiSettings(): Promise<AiSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.aiSettings);

  const response = await strapiClient()
    .single(SINGLE_ENDPOINT.aiSettings)
    .find({ populate: { ExistingMessage: true } });

  return response.data as unknown as AiSettings;
}
