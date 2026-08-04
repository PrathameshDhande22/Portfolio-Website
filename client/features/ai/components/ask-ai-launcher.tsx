"use client";

import { useEffect, useEffectEvent, useState } from "react";
import dynamic from "next/dynamic";
import { LuSparkles } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import type { AiSettings } from "@/types/content";

const AskAiPanel = dynamic(() => import("./ask-ai-panel").then((module) => module.AskAiPanel), {
  ssr: false,
});

interface AskAiLauncherProps {
  label: string;
  settings: AiSettings;
}

export function AskAiLauncher({ label, settings }: AskAiLauncherProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setMounted(true);
      setOpen(true);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  return (
    <>
      <Button
        variant="primary"
        aria-label={label}
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
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

      {mounted ? <AskAiPanel settings={settings} open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
