"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { Activity } from "react-activity-calendar";

const THEME = {
  light: ["#e4e1d9", "#c3cba8", "#9aa878", "#6f8149", "#485824"],
  dark: ["#36372f", "#5c6440", "#889255", "#aec077", "#d2dc95"],
};

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
      theme={THEME}
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
