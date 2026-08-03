import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const TILE_BASE =
  "relative flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-surface p-6 shadow-[0_1px_2px_#1412280a,0_8px_24px_-16px_#1412282e] transition-[transform,border-color,box-shadow] duration-300 ease-smooth hover:-translate-y-1 hover:border-accent tile:col-span-2";

export function Tile({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn(TILE_BASE, className)}>{children}</section>;
}

export function TileLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-[0.9rem] flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.08em] text-ink-3 uppercase before:h-0.5 before:w-3.5 before:flex-none before:rounded-sm before:bg-accent before:content-['']">
      {children}
    </p>
  );
}
