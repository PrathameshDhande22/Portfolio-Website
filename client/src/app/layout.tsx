import "./globals.css";
import type { Metadata } from "next";
import { archivo, interTight } from "@/lib/fonts";
import { env } from "@/lib/env";
import { resolveImage } from "@/lib/media";
import { AppProviders } from "@/providers";
import { getSiteSettings } from "@/features/site/service";
import { getAiSettings } from "@/features/ai/service";
import { RailNav } from "@/features/site/components/rail-nav";
import { SiteFooter } from "@/features/site/components/site-footer";
import { ScrollProgress } from "@/features/site/components/scroll-progress";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = resolveImage(settings.Favicon);

  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: `${settings.SiteName} · ${settings.Designation}`,
      template: `%s · ${settings.SiteName}`,
    },
    icons: favicon ? { icon: favicon.url } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const aiSettings = settings.AskAI?.Enabled ? await getAiSettings() : null;

  const navigation = settings.Navigation.filter((item) => item.Visible && item.Page)
    .sort((a, b) => a.Order - b.Order)
    .map((item) => ({
      title: item.Title,
      href: item.Page!.Slug === "home" ? "/" : `/${item.Page!.Slug}`,
    }));

  const social = settings.SocialLinks.filter((item) => item.Visible)
    .sort((a, b) => a.Order - b.Order)
    .map((item) => ({ platform: item.Platform, icon: item.Icon, url: item.Url }));

  const footerLinks = [...settings.Footer].sort((a, b) => a.Order - b.Order);

  return (
    <html lang="en" suppressHydrationWarning className={cn(archivo.variable, interTight.variable)}>
      <body className="overflow-x-clip bg-paper font-text text-[16px] leading-[1.6] text-ink antialiased before:pointer-events-none before:fixed before:inset-0 before:-z-10 before:bg-[radial-gradient(var(--ink-3)_1px,transparent_1px)] before:bg-size-[24px_24px] before:opacity-[0.13] before:content-['']">
        <AppProviders>
          <ScrollProgress />

          <RailNav
            siteName={settings.SiteName}
            designation={settings.Designation}
            availability={settings.AvailabilityStatus}
            navigation={navigation}
            social={social}
            askAiLabel={settings.AskAI?.Enabled ? settings.AskAI.Text : null}
            aiSettings={aiSettings}
          />

          <div className="flex min-h-dvh flex-col pt-bar nav:ml-rail nav:pt-0">
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter copyright={settings.CopyRightText} links={footerLinks} />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
