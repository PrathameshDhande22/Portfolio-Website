import { strapi } from "@strapi/client";
import { env } from "@/lib/env";

let instance: ReturnType<typeof strapi> | null = null;

export function strapiClient() {
  instance ??= strapi({ baseURL: env.strapiUrl, auth: env.strapiToken });
  return instance;
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
