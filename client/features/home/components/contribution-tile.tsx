import { Tile } from "./tile";
import { ContributionCalendar } from "./contribution-calendar";
import { getContributions } from "../service";

export async function ContributionTile({ username }: { username: string }) {
  const calendar = await getContributions(username);
  if (!calendar) return null;

  return (
    <Tile className="wide:col-span-4">
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="m-0 font-display text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
          What I have been building
        </h2>
        <span className="ml-auto text-[0.74rem] font-semibold tracking-[0.06em] text-ink-3">
          {calendar.total} contributions in the last year
        </span>
      </div>
      <div className="overflow-x-auto text-ink-2 scrollbar-none">
        <ContributionCalendar days={calendar.days} />
      </div>
    </Tile>
  );
}
