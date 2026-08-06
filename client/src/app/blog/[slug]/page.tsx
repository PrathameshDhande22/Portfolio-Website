import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import {
  getBlogBySlug,
  getBlogContent,
  getBlogSlugs,
} from "@/features/blog/service";
import { ArticleToc } from "@/features/blog/components/article-toc";
import { tocFromMarkdown } from "@/features/blog/lib/toc";
import { Markdown } from "@/features/shared/components/markdown";
import { CmsButton } from "@/features/shared/components/cms-button";
import { formatDate, readingMinutes } from "@/lib/format";
import { env } from "@/lib/env";
import { articleJsonLd, articleMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/features/site/service";
import { getPageBySlug } from "@/features/page/service";
import { JsonLd } from "@/features/shared/components/structured-data";

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();

  return slugs.map((slug) => ({ slug }));
}

async function articleContext() {
  const [settings, listing] = await Promise.all([
    getSiteSettings(),
    getPageBySlug("blog"),
  ]);

  return {
    siteUrl: env.siteUrl,
    siteName: settings.SiteName,
    author: settings.SiteName,
    twitterUsername: listing?.SEO?.TwitterCard?.TwitterUsername,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) return {};

  return articleMetadata(blog, await articleContext());
}

export default async function BlogArticlePage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  const [content, context] = await Promise.all([
    getBlogContent(slug),
    articleContext(),
  ]);
  const published = await formatDate(blog.publishedAt ?? blog.createdAt);
  const minutes = readingMinutes(content?.Content);

  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <JsonLd schema={articleJsonLd(blog, context)} />
      <article className="pt-[clamp(2.25rem,4.5vw,3.25rem)]">
        <header className="mb-10">
          <p className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-ink-2 no-underline transition-colors hover:text-accent"
            >
              <LuArrowLeft className="size-3.5" aria-hidden />
              All writing
            </Link>
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {blog.Skill ? (
              <span className="rounded-full border border-accent bg-accent px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium text-accent-ink">
                {blog.Skill.Name}
              </span>
            ) : null}
            <span className="text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">
              {published}
            </span>
            <span className="text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">
              {minutes} min read
            </span>
          </div>

          <h1 className="mb-3 max-w-[24ch] font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
            {blog.Title}
          </h1>

          {blog.Description ? (
            <p className="max-w-[58ch] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.65] text-ink-2">
              {blog.Description}
            </p>
          ) : null}
        </header>

        <div className="grid grid-cols-1 items-start gap-10 nav:grid-cols-[minmax(0,1fr)_200px]">
          <Markdown content={content?.Content} variant="article" />
          <ArticleToc entries={tocFromMarkdown(content?.Content)} />
        </div>

        {content?.Next ? (
          <footer className="mt-14 border-t border-line pt-8">
            {content.Next.Text ? (
              <p className="mb-4 text-[1rem] leading-[1.75] text-ink-2">
                {content.Next.Text}
              </p>
            ) : null}
            {content.Next.Button.length > 0 ? (
              <div className="flex flex-wrap gap-[0.6rem]">
                {content.Next.Button.map((button) => (
                  <CmsButton key={button.id} button={button} />
                ))}
              </div>
            ) : null}
          </footer>
        ) : null}
      </article>
    </div>
  );
}
