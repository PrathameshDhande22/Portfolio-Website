"use client";

import { useEffect, useEffectEvent, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
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
  const pathname = usePathname();
  const router = useRouter();

  const fromRoute = pathname === "/assistant";

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      sendGAEvent("event", "assistant_open", { method: "shortcut" });
      setMounted(true);
      setOpen(true);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  function changeOpen(next: boolean) {
    setOpen(next);

    if (!next && fromRoute) {
      if (window.history.length > 1) router.back();
      else router.push("/");
    }
  }

  return (
    <>
      <Button
        variant="primary"
        aria-label={label}
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          sendGAEvent("event", "assistant_open", { method: "button" });
          setMounted(true);
          setOpen(true);
        }}
        className="h-9.5 flex-none px-[0.9rem] text-[0.78rem] max-ask:w-9.5 max-ask:px-0 nav:h-10.5 nav:flex-1 nav:text-[0.84rem]"
      >
        <LuSparkles className="size-3.75 flex-none" aria-hidden />
        <span className="leading-none max-ask:hidden" aria-hidden>
          {label}
        </span>
      </Button>

      {mounted || fromRoute ? (
        <AskAiPanel settings={settings} open={open || fromRoute} onOpenChange={changeOpen} />
      ) : null}
    </>
  );
}
