import { Suspense } from "react";
import { IntroTile } from "./intro-tile";
import { NowTile } from "./now-tile";
import { OpenRolesTile } from "./open-roles-tile";
import { ContributionTile } from "./contribution-tile";
import { StructuredData } from "@/features/shared/components/structured-data";
import { getSiteSettings } from "@/features/site/service";
import type { Page } from "@/types/content";

export async function HomeRenderer({ page }: { page: Page }) {
  const hero = page.Content.find((block) => block.__component === "home.home-hero");
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
            {hero.GithubUsername ? (
              <Suspense fallback={null}>
                <ContributionTile username={hero.GithubUsername} />
              </Suspense>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
