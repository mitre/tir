import { DateTime } from "luxon";

export function dbNow(): string {
  return DateTime.now().toISO();
}