import type { MetadataRoute } from "next";
import { getPageSlugs } from "@/features/page/service";
import { getBlogs } from "@/features/blog/service";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, blogs] = await Promise.all([getPageSlugs(), getBlogs(1, 100)]);

  const pages = slugs
    .filter((slug) => slug !== "changelog")
    .map((slug) => ({
      url: slug === "home" ? env.siteUrl : `${env.siteUrl}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: slug === "home" ? 1 : 0.8,
    }));

  const posts = blogs.items.map((blog) => ({
    url: `${env.siteUrl}/blog/${blog.Slug}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
