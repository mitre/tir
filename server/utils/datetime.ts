import { DateTime } from "luxon";

export function dbNow(): string {
  return DateTime.now().toISO();
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US");
}
