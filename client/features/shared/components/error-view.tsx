"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title: string;
  description: string;
  error?: Error & { digest?: string };
  reset?: () => void;
}

export function ErrorView({
  title,
  description,
  error,
  reset,
}: ErrorViewProps) {
  const showDetail = process.env.NODE_ENV !== "production" && error;

  return (
    <div className="mx-auto flex max-w-wrap flex-col items-start px-pad py-[clamp(4rem,9vw,7rem)]">
      <p className="mb-6 flex items-center gap-[0.9rem] text-[0.72rem] font-semibold tracking-widest text-ink-3 uppercase">
        {title}
      </p>

      <h1 className="mb-[0.7rem] font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
        {description}
      </h1>

      {error?.digest ? (
        <p className="mb-6 font-mono text-[0.8rem] text-ink-3">
          Reference: {error.digest}
        </p>
      ) : null}

      {showDetail ? (
        <pre className="mb-8 max-w-full overflow-x-auto rounded-tile bg-slab px-[1.15rem] py-4 font-mono text-[0.8rem] leading-[1.6] text-slab-fg">
          {error.stack ?? error.message}
        </pre>
      ) : null}

      <div className="flex flex-wrap gap-[0.6rem]">
        {reset ? (
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        ) : null}
        <Link href="/" className="inline-flex">
          <Button variant="secondary" render={<span />}>
            Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
