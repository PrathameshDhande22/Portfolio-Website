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
} as const;

export const SINGLE_ENDPOINT = {
  siteSettings: "site-setting",
  aiSettings: "ai-setting",
  robots: "robot",
} as const;

export const CACHE_TAG = {
  siteSettings: "site-settings",
  aiSettings: "ai-settings",
  robots: "robots",
  pages: "pages",
  blogs: "blogs",
  versions: "versions",
} as const;

const badgesPopulate = {
  Badges: { populate: { Skill: { populate: { Icon: true } } } },
} as const;

const timelinePopulate = { populate: badgesPopulate } as const;

const sectionPopulate = {
  Categories: { populate: { Skills: { populate: { Icon: true } } } },
  Projects: {
    populate: {
      Thumbnail: true,
      Screenshots: true,
      Tags: { populate: { Technology: { populate: { Icon: true } } } },
      Links: true,
    },
  },
  Experiences: { populate: { Experience: timelinePopulate } },
  Timelines: { populate: { Timeline: timelinePopulate } },
  Educations: { populate: { Timeline: timelinePopulate } },
  Certifications: { populate: { VerifyLink: true } },
  Blogs: { populate: { Thumbnail: true, Skill: { populate: { Icon: true } } } },
} as const;

export const SEO_POPULATE = {
  populate: {
    OpenGraph: { populate: { Image: true } },
    TwitterCard: { populate: { Image: true } },
    StructuredData: true,
  },
} as const;

export const PAGE_POPULATE = {
  SEO: SEO_POPULATE,
  Content: {
    on: {
      "home.home-hero": {
        populate: { ProfileImage: true, TypingText: true, Buttons: true },
      },
      "shared.hero": true,
      "shared.badge": true,
      "shared.links": true,
      "home.social-links": true,
      "shared.next": { populate: { Divider: true, Button: true } },
      "section.contact-form": { populate: { SendMessage: true } },
      "section.resume": { populate: { Resume: true } },
      "section.skills": { populate: sectionPopulate },
    },
  },
} as const;
