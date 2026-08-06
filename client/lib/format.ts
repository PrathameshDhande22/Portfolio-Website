import moment from "moment";
import readingTime from "reading-time";

export function readingMinutes(markdown: string | null | undefined): number {
  return markdown ? Math.max(1, Math.round(readingTime(markdown).minutes)) : 1;
}

export async function formatDate(value: string | null | undefined): Promise<string> {
  "use cache";
  return value ? moment(value).format("MMM D, YYYY") : "";
}

export async function formatMonthYear(value: string | null | undefined): Promise<string> {
  "use cache";
  return value ? moment(value).format("MMM YYYY") : "";
}

export async function formatYear(value: string | null | undefined): Promise<string> {
  "use cache";
  return value ? moment(value).format("YYYY") : "";
}

export async function formatYearRange(
  start: string | null | undefined,
  end: string | null | undefined
): Promise<string> {
  "use cache";
  if (!start) return "";

  return `${moment(start).format("YYYY")} → ${end ? moment(end).format("YYYY") : "now"}`;
}
