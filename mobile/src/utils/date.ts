import {
  format,
  differenceInCalendarDays,
  addDays,
  parseISO,
} from "date-fns";

/** yyyy-MM-dd in local time. */
export const toISODate = (d: Date = new Date()): string => format(d, "yyyy-MM-dd");

export const todayISO = (): string => toISODate();

/** Whole calendar days from `fromISO` to `toISO` (can be negative). */
export const daysBetween = (fromISO: string, toISO: string): number =>
  differenceInCalendarDays(parseISO(toISO), parseISO(fromISO));

export const isoPlusDays = (iso: string, n: number): string =>
  toISODate(addDays(parseISO(iso), n));

/** e.g. "Tue, Sep 9" */
export const prettyDate = (iso: string): string => format(parseISO(iso), "EEE, MMM d");
