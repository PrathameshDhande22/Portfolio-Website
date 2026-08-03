import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/features/page/service";
import { HomeRenderer } from "@/features/home/components/home-renderer";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");

  return pageMetadata(page?.SEO, "/");
}

export default async function HomePage() {
  const page = await getPageBySlug("home");

  if (!page) notFound();

  return <HomeRenderer page={page} />;
}
