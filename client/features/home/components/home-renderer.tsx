import { Suspense } from "react";
import { IntroTile } from "./intro-tile";
import { NowTile } from "./now-tile";
import { OpenRolesTile } from "./open-roles-tile";
import { ContributionTile } from "./contribution-tile";
import { StackTile } from "@/features/skills/components/stack-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { StructuredData } from "@/features/shared/components/structured-data";
import { getSiteSettings } from "@/features/site/service";
import type { Page } from "@/types/content";

export async function HomeRenderer({ page }: { page: Page }) {
  const hero = page.Content.find((block) => block.__component === "home.home-hero");
  const sections = page.Content.filter((block) => block.__component === "section.skills");
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-wrap px-pad">
      <StructuredData data={page.SEO?.StructuredData} />

      <div className="grid grid-cols-1 gap-3.5 py-[clamp(1.5rem,3vw,2.25rem)] tile:grid-cols-2 wide:grid-cols-4">
        {hero ? (
          <>
            <IntroTile hero={hero} />
            <NowTile hero={hero} />
            <OpenRolesTile hero={hero} email={settings.Email} />
            {sections.map((section) =>
              section.Type === "Skills" ? (
                <Suspense key={section.id} fallback={<Skeleton className="h-55 rounded-[18px] tile:col-span-2 wide:col-span-2" />}>
                  <StackTile section={section} />
                </Suspense>
              ) : null
            )}

            {hero.GithubUsername ? (
              <Suspense
                fallback={<Skeleton className="h-55 rounded-[18px] tile:col-span-2 wide:col-span-4" />}
              >
                <ContributionTile username={hero.GithubUsername} />
              </Suspense>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
