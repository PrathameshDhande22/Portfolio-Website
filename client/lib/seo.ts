import type { Metadata } from "next";
import { resolveImage } from "@/lib/media";
import type { Seo } from "@/types/components";

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
