import type { StrapiEntity, StrapiMedia } from "./strapi";
import type {
  AskAi,
  ButtonLink,
  FooterLink,
  LinkItem,
  NavigationItem,
  PageBlock,
  Seo,
  SocialLink,
  SuggestedPrompt,
  TimeLineEntry,
} from "./components";

export interface Page extends StrapiEntity {
  Title: string;
  Slug: string;
  SEO: Seo | null;
  Content: PageBlock[];
}

export interface SkillCategory extends StrapiEntity {
  Name: string;
  Order: number;
  Visible: boolean;
  Skills: Skill[];
}

export interface Skill extends StrapiEntity {
  Name: string;
  Category: SkillCategory | null;
  Icon: StrapiMedia | null;
  IconClass: string | null;
  Order: number;
}

export interface ProjectTag extends StrapiEntity {
  Tag: string | null;
  Technology: Skill | null;
}

export interface Project extends StrapiEntity {
  Title: string;
  Order: number | null;
  Category: string;
  Description: string;
  Thumbnail: StrapiMedia | null;
  Screenshots: StrapiMedia[];
  StartYear: string | null;
  EndYear: string | null;
  Tags: ProjectTag[];
  Links: LinkItem[];
}

export interface Experience extends StrapiEntity {
  Experience: TimeLineEntry;
}

export interface Education extends StrapiEntity {
  Timeline: TimeLineEntry;
}

export interface TimeLine extends StrapiEntity {
  Timeline: TimeLineEntry;
}

export interface Certification extends StrapiEntity {
  Title: string;
  Description: string | null;
  Active: boolean;
  CertificateID: string | null;
  Certifier: string | null;
  Issued: string | null;
  Expires: string | null;
  VerifyLink: LinkItem | null;
}

export interface Blog extends StrapiEntity {
  Title: string;
  Slug: string;
  Skill: Skill | null;
  Description: string | null;
  Thumbnail: StrapiMedia | null;
  BlogContent: BlogContent | null;
}

export interface BlogContent extends StrapiEntity {
  Blog: Blog | null;
  Content: string | null;
  Next: {
    id: number;
    Text: string | null;
    Description: string | null;
    Button: ButtonLink[];
  } | null;
}

export interface Version extends StrapiEntity {
  Version: string;
  ChangeLog: string;
}

export interface SiteSettings extends StrapiEntity {
  SiteName: string;
  Designation: string;
  ProfileImage: StrapiMedia | null;
  Resume: string;
  CopyRightText: string | null;
  Location: string;
  Email: string;
  AvailabilityStatus: string | null;
  Favicon: StrapiMedia | null;
  AskAI: AskAi;
  Navigation: NavigationItem[];
  SocialLinks: SocialLink[];
  Footer: FooterLink[];
}

export interface AiSettings extends StrapiEntity {
  TopTitle: string;
  Header: string;
  Description: string | null;
  ExistingMessage: SuggestedPrompt[];
  Warning: string | null;
  SendMessagePlaceholder: string | null;
}

export interface Robots extends StrapiEntity {
  robotstxt: string | null;
}

export interface ContactSubmission {
  Name: string;
  Email: string;
  Subject?: string;
  Message: string;
  Source?: string;
  IPAddress?: string;
  UserAgent?: string;
}
