"use client";

import { useTheme } from "next-themes";
import { LuMoon, LuSun } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch theme"
      className="bg-transparent text-ink-2 hover:translate-y-0 hover:bg-surface-2 hover:text-ink nav:size-10.5"
    >
      <LuMoon className="size-4 dark:hidden" aria-hidden />
      <LuSun className="hidden size-4 dark:block" aria-hidden />
    </Button>
  );
}
