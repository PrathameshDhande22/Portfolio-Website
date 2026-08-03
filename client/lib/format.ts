import moment from "moment";
import readingTime from "reading-time";

export function readingMinutes(markdown: string | null | undefined): number {
  return markdown ? Math.max(1, Math.round(readingTime(markdown).minutes)) : 1;
}

export function formatDate(value: string | null | undefined): string {
  return value ? moment(value).format("MMM D, YYYY") : "";
}

export function formatMonthYear(value: string | null | undefined): string {
  return value ? moment(value).format("MMM YYYY") : "";
}

export function formatYear(value: string | null | undefined): string {
  return value ? moment(value).format("YYYY") : "";
}

export function formatYearRange(start: string | null | undefined, end: string | null | undefined): string {
  const from = formatYear(start);
  return from ? `${from} → ${formatYear(end) || "now"}` : "";
}
