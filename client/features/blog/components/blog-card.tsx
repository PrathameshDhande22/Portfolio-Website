import Link from "next/link";
import Image from "next/image";
import { LuArrowUpRight } from "react-icons/lu";
import { formatDate } from "@/lib/format";
import { resolveImage } from "@/lib/media";
import type { Blog } from "@/types/content";

export async function BlogCard({ blog, minutes }: { blog: Blog; minutes: number }) {
  const cover = resolveImage(blog.Thumbnail, 640);
  const published = await formatDate(blog.publishedAt ?? blog.createdAt);

  return (
    <Link
      href={`/blog/${blog.Slug}`}
      className="group flex flex-col overflow-hidden rounded-tile border border-line bg-surface no-underline transition-[border-color,transform] duration-300 ease-smooth hover:-translate-y-1 hover:border-accent"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-accent-soft">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || blog.Title}
            fill
            sizes="(max-width: 660px) 100vw, (max-width: 1120px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {blog.Skill ? (
            <span className="rounded-full border border-line px-[0.6rem] py-[0.2rem] text-[0.74rem] font-medium text-ink-2">
              {blog.Skill.Name}
            </span>
          ) : null}
          <span className="text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">{published}</span>
          <span className="text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">{minutes} min read</span>
        </div>

        <h3 className="mb-2 font-display text-[1.1rem] leading-[1.25] font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
          {blog.Title}
        </h3>

        {blog.Description ? (
          <p className="mb-4 text-[0.9rem] leading-[1.65] text-ink-2">{blog.Description}</p>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-[0.4rem] text-[0.88rem] font-semibold text-accent">
          Read the post
          <LuArrowUpRight
            className="size-3.25 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
