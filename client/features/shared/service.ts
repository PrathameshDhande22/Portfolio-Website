import { strapi } from "@strapi/client";
import { env } from "@/lib/env";

let instance: ReturnType<typeof strapi> | null = null;

export function strapiClient() {
  instance ??= strapi({ baseURL: env.strapiUrl, auth: env.strapiToken });
  return instance;
}

export async function findAll<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const response = await strapiClient()
      .collection(endpoint)
      .find({ ...params, pagination: { page, pageSize: 100, withCount: true } });

    items.push(...(response.data as T[]));
    pageCount = response.meta.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);

  return items;
}

export const ENDPOINT = {
  pages: "page",
  blogs: "blogs",
  blogContents: "blog-contents",
  certifications: "certifications",
  contacts: "contacts",
  educations: "educations",
  experiences: "experiences",
  projects: "projects",
  skills: "skills",
  skillCategories: "skill-categories",
  timeLines: "time-lines",
  versions: "versions",
};

export const SINGLE_ENDPOINT = {
  siteSettings: "site-setting",
  aiSettings: "ai-setting",
};

export const CACHE_TAG = {
  siteSettings: "site-settings",
  aiSettings: "ai-settings",
  pages: "pages",
  blogs: "blogs",
  versions: "versions",
  skills: "skills",
  projects: "projects",
  experiences: "experiences",
  educations: "educations",
  timelines: "timelines",
  certifications: "certifications",
};

export const SEO_POPULATE = {
  populate: {
    OpenGraph: { populate: "*" },
    TwitterCard: { populate: "*" },
    StructuredData: true,
  },
};

export const PAGE_POPULATE = {
  SEO: SEO_POPULATE,
  Content: { populate: "*" },
};
