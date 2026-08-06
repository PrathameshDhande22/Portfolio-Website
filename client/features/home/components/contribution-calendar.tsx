"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { Activity } from "react-activity-calendar";

const RAMP = ["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4"].map((name) => `var(${name})`);

const ActivityCalendar = dynamic(
  () => import("react-activity-calendar").then((module) => module.ActivityCalendar),
  { ssr: false, loading: () => <div className="h-32.5" /> }
);

export function ContributionCalendar({ days }: { days: Activity[] }) {
  const { resolvedTheme } = useTheme();

  return (
    <ActivityCalendar
      data={days}
      colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
      theme={{ light: RAMP, dark: RAMP }}
      blockSize={11}
      blockMargin={3}
      blockRadius={2}
      fontSize={12}
      showTotalCount={false}
      showColorLegend
      showMonthLabels
      labels={{ legend: { less: "Less", more: "More" } }}
    />
  );
}
