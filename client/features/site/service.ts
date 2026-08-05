import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, SINGLE_ENDPOINT, strapiClient } from "@/features/shared/service";
import type { SiteSettings } from "@/types/content";

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
        SocialLinks: true,
        Footer: true,
        Navigation: { populate: "*" },
      },
    });

  return response.data as SiteSettings;
}
