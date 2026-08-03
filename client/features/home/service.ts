import { cacheLife, cacheTag } from "next/cache";
import type { Activity } from "react-activity-calendar";
import { env } from "@/lib/env";

export interface ContributionCalendar {
  total: number;
  days: Activity[];
}

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

interface GraphQlDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface GraphQlResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: GraphQlDay[] }[];
        };
      };
    } | null;
  };
}

export async function getContributions(username: string): Promise<ContributionCalendar | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`github-${username}`);

  if (!env.githubToken) return null;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: username } }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as GraphQlResponse;
  const calendar = payload.data?.user?.contributionsCollection.contributionCalendar;

  if (!calendar) return null;

  return {
    total: calendar.totalContributions,
    days: calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))
    ),
  };
}
