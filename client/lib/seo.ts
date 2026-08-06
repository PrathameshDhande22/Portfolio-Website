import type { Metadata } from "next";
import { resolveImage } from "@/lib/media";
import type { Seo } from "@/types/components";
import type { Blog } from "@/types/content";

interface ArticleContext {
  siteUrl: string;
  siteName: string;
  author: string;
  twitterUsername?: string | null;
}

export function articleMetadata(blog: Blog, context: ArticleContext): Metadata {
  const url = `${context.siteUrl}/blog/${blog.Slug}`;
  const cover = resolveImage(blog.Thumbnail, 1200);
  const description = blog.Description ?? `${blog.Title} — an article by ${context.author}.`;
  const images = cover ? [{ url: cover.url, width: cover.width, height: cover.height, alt: blog.Title }] : undefined;

  return {
    title: blog.Title,
    description,
    keywords: [blog.Skill?.Name, context.siteName, "article"].filter(Boolean) as string[],
    authors: [{ name: context.author }],
    alternates: { canonical: `/blog/${blog.Slug}` },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "article",
      title: blog.Title,
      description,
      url,
      siteName: context.siteName,
      publishedTime: blog.publishedAt ?? blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [context.author],
      tags: blog.Skill ? [blog.Skill.Name] : undefined,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.Title,
      description,
      site: context.twitterUsername ?? undefined,
      creator: context.twitterUsername ?? undefined,
      images: cover ? [cover.url] : undefined,
    },
  };
}

export function articleJsonLd(blog: Blog, context: ArticleContext): Record<string, unknown> {
  const cover = resolveImage(blog.Thumbnail, 1200);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.Title,
    description: blog.Description ?? undefined,
    image: cover ? [cover.url] : undefined,
    datePublished: blog.publishedAt ?? blog.createdAt,
    dateModified: blog.updatedAt,
    author: { "@type": "Person", name: context.author, url: context.siteUrl },
    publisher: { "@type": "Person", name: context.siteName, url: context.siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${context.siteUrl}/blog/${blog.Slug}` },
    keywords: blog.Skill?.Name,
  };
}

export function pageMetadata(seo: Seo | null | undefined, canonical: string): Metadata {
  if (!seo) return {};

  const [index, follow] = (seo.Robots ?? "index, follow").split(",").map((part) => part.trim());
  const url = seo.CanonicalURL ?? canonical;
  const ogImage = resolveImage(seo.OpenGraph?.Image ?? null);
  const twitterImage = resolveImage(seo.TwitterCard?.Image ?? null);

  return {
    title: seo.MetaTitle,
    description: seo.MetaDescription,
    keywords: seo.Keywords?.split(",").map((keyword) => keyword.trim()),
    alternates: { canonical: url },
    robots: { index: index === "index", follow: follow === "follow" },
    openGraph: seo.OpenGraph
      ? {
          title: seo.OpenGraph.Title ?? seo.MetaTitle,
          description: seo.OpenGraph.Description ?? seo.MetaDescription,
          url: seo.OpenGraph.Url ?? url,
          type: seo.OpenGraph.Type ?? "website",
          images: ogImage ? [{ url: ogImage.url, width: ogImage.width, height: ogImage.height }] : undefined,
        }
      : undefined,
    twitter: seo.TwitterCard
      ? {
          card: seo.TwitterCard.CardType ?? "summary_large_image",
          title: seo.TwitterCard.Title ?? seo.MetaTitle,
          description: seo.TwitterCard.Description ?? seo.MetaDescription,
          site: seo.TwitterCard.TwitterUsername ?? undefined,
          images: twitterImage ? [twitterImage.url] : undefined,
        }
      : undefined,
      
  };
}
