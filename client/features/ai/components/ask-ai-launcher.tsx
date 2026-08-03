"use client";

import { LuSparkles } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function AskAiLauncher({ label }: { label: string }) {
  return (
    <Button
      variant="primary"
      aria-label={label}
      aria-keyshortcuts="Meta+K Control+K"
      className="h-9.5 flex-none px-[0.9rem] text-[0.78rem] max-ask:w-9.5 max-ask:px-0 nav:h-10.5 nav:flex-1 nav:text-[0.84rem]"
    >
      <LuSparkles className="size-3.75 flex-none" aria-hidden />
      <span className="max-ask:hidden" aria-hidden>
        {label}
      </span>
      <kbd className="hidden rounded border px-1 text-[0.68rem] font-semibold opacity-60 nav:inline" aria-hidden>
        ⌘K
      </kbd>
    </Button>
  );
}
