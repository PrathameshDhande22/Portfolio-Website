import type { StrapiMedia } from "./strapi";
import type { Blog, Certification, Education, Experience, Page, Project, Skill, SkillCategory, TimeLine } from "./content";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "info" | "warning";
export type IconAlign = "Left" | "Right";
export type LinkIconAlign = "right" | "left" | "center";
export type RobotsDirective = "index, follow" | "index, nofollow" | "noindex, follow" | "noindex, nofollow";
export type OpenGraphType = "website" | "article" | "profile";
export type SectionType = "Skills" | "Projects" | "Experience" | "Timeline" | "Certifications" | "Educations" | "Blogs";

export type SocialPlatform =
  | "github"
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "youtube"
  | "medium"
  | "devto"
  | "stackoverflow"
  | "leetcode"
  | "hackerrank"
  | "codepen"
  | "behance"
  | "dribbble"
  | "email"
  | "website";

export interface Divider {
  id: number;
  LeftText: string | null;
  RightText: string | null;
}

export interface ButtonLink {
  id: number;
  Variant: ButtonVariant;
  Icon: string | null;
  Text: string;
  Url: string | null;
  OpenInNewTab: boolean | null;
  IconAlign: IconAlign | null;
}

export interface LinkItem {
  id: number;
  Title: string;
  Text: string;
  Url: string;
  Icon: string | null;
  OpenInNewTab: boolean;
  IconAlign: LinkIconAlign | null;
}

export interface Hero {
  id: number;
  Title: string;
  Description: string;
  AdditionalText: string | null;
}

export interface TypingText {
  id: number;
  StartText: string;
  Text: string;
}

export interface BadgeTag {
  id: number;
  Skill: Skill | null;
  Order: number;
  Highlight: boolean;
}

export interface TimeLineEntry {
  id: number;
  Title: string;
  SubTitle: string | null;
  ShortTitle: string | null;
  Description: string | null;
  Badges: BadgeTag[];
}

export interface NextBlock {
  id: number;
  Divider: Divider | null;
  Text: string | null;
  Description: string | null;
  Button: ButtonLink[];
}

export interface OpenGraph {
  id: number;
  Title: string | null;
  Description: string | null;
  Image: StrapiMedia | null;
  Url: string | null;
  Type: OpenGraphType | null;
}

export interface TwitterCard {
  id: number;
  Title: string | null;
  Description: string | null;
  Image: StrapiMedia | null;
  CardType: "summary_large_image" | null;
  TwitterUsername: string | null;
}

export interface StructuredData {
  id: number;
  Enable: boolean;
  JSONSchema: Record<string, unknown> | null;
}

export interface Seo {
  id: number;
  MetaTitle: string;
  MetaDescription: string;
  Keywords: string | null;
  CanonicalURL: string | null;
  Robots: RobotsDirective | null;
  OpenGraph: OpenGraph | null;
  TwitterCard: TwitterCard | null;
  StructuredData: StructuredData | null;
}

export interface NavigationItem {
  id: number;
  Title: string;
  Page: Pick<Page, "id" | "documentId" | "Slug" | "Title"> | null;
  Order: number;
  Visible: boolean;
}

export interface SocialLink {
  id: number;
  Platform: SocialPlatform;
  Icon: string;
  Url: string;
  Order: number;
  Visible: boolean;
}

export interface FooterLink {
  id: number;
  Title: string;
  Url: string;
  OpenInNewTab: boolean;
  Order: number;
}

export interface AskAi {
  id: number;
  Text: string;
  Enabled: boolean;
}

export interface HomeHero {
  id: number;
  Name: string;
  Description: string;
  ProfileImage: StrapiMedia | null;
  AboutTitle: string;
  Company: string;
  CompanyDescription: string;
  OpentonewRolesText: string | null;
  OpentoNewRolesDescription: string | null;
  GithubUsername: string | null;
  TypingText: TypingText[];
  Buttons: ButtonLink[];
}

export interface ContactFormLabels {
  id: number;
  YourName: string;
  EmailText: string;
  Subject: string | null;
  Message: string;
  SendMessage: ButtonLink | null;
}

export interface ResumeBlock {
  id: number;
  Resume: StrapiMedia | null;
}

export interface SuggestedPrompt {
  id: number;
  Text: string | null;
}

export interface SectionBlock {
  id: number;
  ShowAll: boolean;
  Type: SectionType;
  Categories: SkillCategory[];
  Projects: Project[];
  Experiences: Experience[];
  Timelines: TimeLine[];
  Educations: Education[];
  Certifications: Certification[];
  Blogs: Blog[];
}

export type PageBlock =
  | ({ __component: "home.home-hero" } & HomeHero)
  | ({ __component: "shared.hero" } & Hero)
  | ({ __component: "shared.badge" } & Divider)
  | ({ __component: "section.skills" } & SectionBlock)
  | ({ __component: "shared.next" } & NextBlock)
  | ({ __component: "shared.links" } & LinkItem)
  | ({ __component: "home.social-links" } & SocialLink)
  | ({ __component: "section.contact-form" } & ContactFormLabels)
  | ({ __component: "section.resume" } & ResumeBlock);

export type PageBlockName = PageBlock["__component"];
