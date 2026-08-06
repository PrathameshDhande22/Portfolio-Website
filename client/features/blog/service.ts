import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { Paginated } from "@/types/strapi";
import type { Blog, BlogContent } from "@/types/content";

export const BLOG_PAGE_SIZE = 9;

const LIST_POPULATE = { Thumbnail: true, Skill: true };

export async function getBlogs(page = 1, pageSize = BLOG_PAGE_SIZE): Promise<Paginated<Blog>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.blogs);

  const response = await strapiClient()
    .collection(ENDPOINT.blogs)
    .find({
      populate: LIST_POPULATE,
      sort: ["createdAt:desc"],
      pagination: { page, pageSize, withCount: true },
    });

  const items = response.data as Blog[];

  return {
    items,
    pagination: response.meta.pagination ?? { page, pageSize, pageCount: 1, total: items.length },
  };
}

export async function getBlogSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.blogs);

  const response = await strapiClient()
    .collection(ENDPOINT.blogs)
    .find({ fields: ["Slug"], pagination: { pageSize: 100 } });

  return (response.data as Blog[]).map((blog) => blog.Slug);
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.blogs, `blog-${slug}`);

  const response = await strapiClient()
    .collection(ENDPOINT.blogs)
    .find({
      filters: { Slug: { $eq: slug } },
      populate: LIST_POPULATE,
      pagination: { pageSize: 1 },
    });

  return (response.data[0] as Blog) ?? null;
}

export async function getBlogContent(slug: string): Promise<BlogContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.blogs, `blog-${slug}`);

  const response = await strapiClient()
    .collection(ENDPOINT.blogContents)
    .find({
      filters: { Blog: { Slug: { $eq: slug } } },
      populate: { Next: { populate: { Button: true } } },
      pagination: { pageSize: 1 },
    });

  return (response.data[0] as BlogContent) ?? null;
}
