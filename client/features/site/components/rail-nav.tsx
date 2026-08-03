"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuMenu, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/features/shared/components/icon";
import { ThemeToggle } from "@/features/shared/components/theme-toggle";
import { AskAiLauncher } from "@/features/ai/components/ask-ai-launcher";

const MENU_ID = "rail-navigation";

export interface RailNavItem {
  title: string;
  href: string;
}

export interface RailSocialItem {
  platform: string;
  icon: string;
  url: string;
}

interface RailNavProps {
  siteName: string;
  designation: string;
  availability: string | null;
  navigation: RailNavItem[];
  social: RailSocialItem[];
  askAiLabel: string | null;
}

export function RailNav({ siteName, designation, availability, navigation, social, askAiLabel }: RailNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape" && open) setOpen(false);
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-bar w-full items-center gap-4 overflow-visible border-b border-line bg-surface px-pad nav:inset-y-0 nav:right-auto nav:h-auto nav:w-rail nav:flex-col nav:items-stretch nav:gap-7 nav:overflow-y-auto nav:border-r nav:border-b-0 nav:px-6 nav:py-8 nav:scrollbar-none nav:[&::-webkit-scrollbar]:hidden">
      <Link href="/" className="mr-auto block min-w-0 no-underline nav:mr-0">
        <span className="block font-display text-[0.82rem] leading-[1.1] font-semibold tracking-[-0.02em] max-ask:text-[0.76rem] nav:text-[1.15rem] nav:leading-[1.15]">
          {siteName}
        </span>
        <span className="mt-[0.3rem] hidden text-[0.8rem] text-ink-2 nav:block">{designation}</span>
      </Link>

      <nav
        id={MENU_ID}
        aria-label="Main"
        className={`${
          open ? "flex animate-drop" : "hidden"
        } absolute inset-x-0 top-full max-h-[calc(100dvh-var(--spacing-bar))] flex-col overflow-y-auto border-b border-line bg-surface px-pad pt-2 pb-5 nav:static nav:flex nav:max-h-none nav:overflow-visible nav:border-0 nav:p-0`}
      >
        {navigation.map((item) => {
          const current = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`relative flex items-center rounded-md py-[0.65rem] pl-[0.9rem] text-[0.92rem] no-underline transition-[color,padding-left] duration-200 ease-smooth before:absolute before:top-1/2 before:left-0 before:w-0.75 before:-translate-y-1/2 before:rounded-[3px] before:bg-accent before:transition-[height] before:duration-200 before:ease-smooth before:content-[''] hover:pl-[1.15rem] hover:text-ink hover:before:h-[55%] nav:py-2 ${
                current ? "font-semibold text-ink before:h-full" : "font-medium text-ink-2 before:h-0"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-none flex-row items-center gap-2 nav:mt-auto nav:flex-col nav:items-stretch nav:gap-4">
        {availability ? (
          <p className="hidden items-center gap-2 text-[0.76rem] font-medium text-ink-2 before:size-1.75 before:rounded-full before:bg-accent before:content-[''] nav:inline-flex">
            {availability}
          </p>
        ) : null}

        {social.length > 0 ? (
          <ul className="hidden list-none gap-3 p-0 nav:flex">
            {social.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-3 transition-[color,transform] duration-200 ease-smooth hover:-translate-y-0.5 hover:text-accent"
                >
                  <Icon name={item.icon} platform={item.platform} className="block size-4.25" />
                  <span className="sr-only">{item.platform}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex gap-1.5 nav:gap-2">
          {askAiLabel ? <AskAiLauncher label={askAiLabel} /> : null}
          <ThemeToggle />
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="bg-transparent text-ink-2 hover:translate-y-0 hover:bg-surface-2 hover:text-ink nav:hidden"
          >
            {open ? <LuX className="size-4" aria-hidden /> : <LuMenu className="size-4" aria-hidden />}
          </Button>
        </div>
      </div>
    </header>
  );
}
