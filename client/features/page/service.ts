import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, PAGE_POPULATE, strapiClient } from "@/features/shared/service";
import type { Page } from "@/types/content";

export async function getPageBySlug(slug: string): Promise<Page | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.pages, `page-${slug}`);

  const response = await strapiClient()
    .collection(ENDPOINT.pages)
    .find({
      filters: { Slug: { $eq: slug } },
      populate: PAGE_POPULATE,
      pagination: { pageSize: 1 },
    });

  return (response.data[0] as Page) ?? null;
}

export async function getPageSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.pages);

  const response = await strapiClient()
    .collection(ENDPOINT.pages)
    .find({ fields: ["Slug"], pagination: { pageSize: 100 } });

  return (response.data as Page[]).map((page) => page.Slug);
}
