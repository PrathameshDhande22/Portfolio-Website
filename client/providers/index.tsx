"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="portfolio-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
