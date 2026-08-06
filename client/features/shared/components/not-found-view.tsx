"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";

const TRACE = [
  { at: "at Router.resolve", where: "app/[...slug]/page.tsx:24:11" },
  { at: "at getPageBySlug", where: "features/page/service.ts:9:18" },
  { at: "at renderPage", where: "next/dist/server/render.js" },
];

export function NotFoundView() {
  const pathname = usePathname();
  const still = useReducedMotion() ?? false;

  const step = (index: number) =>
    still ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.09 } };

  return (
    <div className="mx-auto flex max-w-wrap flex-col items-start px-pad py-[clamp(3rem,8vw,6rem)]">
      <motion.p
        {...step(0)}
        className="mb-4 flex items-center gap-2 text-[0.72rem] font-semibold tracking-widest text-ink-3 uppercase"
      >
        <span className="size-2 rounded-full bg-accent" aria-hidden />
        Uncaught RouteError
      </motion.p>

      <motion.h1
        {...step(1)}
        className="mb-2 font-display text-[clamp(4rem,16vw,9rem)] leading-[0.9] font-bold tracking-[-0.06em] text-ink"
      >
        <span className="text-accent">4</span>0<span className="text-accent">4</span>
      </motion.h1>

      <motion.p {...step(2)} className="mb-8 max-w-[46ch] text-[1.05rem] leading-[1.65] text-ink-2">
        That route never resolved. It may have been renamed, unpublished, or never existed.
      </motion.p>

      <motion.div
        {...step(3)}
        className="mb-8 w-full max-w-[64ch] overflow-hidden rounded-tile border border-line bg-surface font-mono text-[0.82rem] leading-[1.9]"
      >
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
          <span className="text-[0.72rem] tracking-[0.06em] text-ink-3 uppercase">stack trace</span>
        </div>

        <div className="overflow-x-auto px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-accent">$</span>
            <span className="text-ink-3">GET</span>
            <span className="text-ink">{pathname}</span>
            <span className="min-w-4 flex-1 border-b border-dashed border-line" />
            <span className="text-accent">404</span>
          </div>

          <div className="mt-1 text-ink-2">
            <span className="text-ink">Error</span>: no route matched this URL
          </div>

          {TRACE.map((line, index) => (
            <motion.div
              key={line.where}
              {...(still ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 + index * 0.12 } })}
              className="pl-4 text-ink-3"
            >
              {line.at} <span className="text-ink-2">({line.where})</span>
            </motion.div>
          ))}

          <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" aria-hidden />
        </div>
      </motion.div>

      <motion.div {...step(4)} className="flex flex-wrap gap-[0.6rem]">
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          Back home
        </Link>
        <Link href="/blog" className={buttonVariants({ variant: "secondary" })}>
          Read the blog
        </Link>
      </motion.div>
    </div>
  );
}
