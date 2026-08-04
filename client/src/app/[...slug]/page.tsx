import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getPageSlugs } from "@/features/page/service";
import { PageRenderer } from "@/features/page/components/page-renderer";
import { pageMetadata } from "@/lib/seo";

function toSlug(segments: string[]): string | null {
  return segments.length === 1 && segments[0] !== "home" ? segments[0] : null;
}

export async function generateStaticParams() {
  const slugs = await getPageSlugs();

  return slugs.filter((slug) => slug !== "home").map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const slug = toSlug((await params).slug);
  const page = slug ? await getPageBySlug(slug) : null;

  return pageMetadata(page?.SEO, `/${slug}`);
}

export default async function DynamicPage({ params, searchParams }: PageProps<"/[...slug]">) {
  const slug = toSlug((await params).slug);
  const page = slug ? await getPageBySlug(slug) : null;

  if (!page) notFound();

  return <PageRenderer page={page} searchParams={searchParams} />;
}
