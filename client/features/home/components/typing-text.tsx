"use client";

import { TypeAnimation } from "react-type-animation";
import type { TypingText as TypingTextData } from "@/types/components";

const HOLD_MS = 1600;

export function TypingText({ phrases }: { phrases: TypingTextData[] }) {
  if (phrases.length === 0) return null;

  const sharedStart = phrases.every((phrase) => phrase.StartText === phrases[0].StartText);
  const prefix = sharedStart ? phrases[0].StartText : null;
  const sequence = phrases.flatMap((phrase) => [
    prefix ? phrase.Text : `${phrase.StartText} ${phrase.Text}`,
    HOLD_MS,
  ]);

  return (
    <p className="mt-[0.7rem] min-h-[1.6em] font-display text-[clamp(1.05rem,1.9vw,1.5rem)] font-semibold tracking-[-0.02em]">
      {prefix ? `${prefix} ` : null}
      <TypeAnimation
        sequence={sequence}
        repeat={Infinity}
        speed={55}
        deletionSpeed={70}
        cursor
        className="text-slab-muted"
      />
    </p>
  );
}
