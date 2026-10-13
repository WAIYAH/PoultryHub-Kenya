// Date and time display in East Africa Time (DESIGN_SYSTEM.md §14, REQUIREMENTS.md KM-12).
// Timestamps are stored in UTC; everything shown to people is in Africa/Nairobi (UTC+3, no DST).

const TIME_ZONE = "Africa/Nairobi";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const shortDateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
});
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

function toDate(value: Date | string): Date {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid date: ${String(value)}`);
  return date;
}

/** "13 Oct 2026" */
export function formatDate(value: Date | string): string {
  return dateFormat.format(toDate(value));
}

/** "Tue, 13 Oct" */
export function formatShortDate(value: Date | string): string {
  return shortDateFormat.format(toDate(value)).replace(/^(\w{3}) /, "$1, ");
}

/** "2:30 pm" */
export function formatTime(value: Date | string): string {
  return timeFormat
    .format(toDate(value))
    .replace(/\s?([ap])\.?m\.?$/i, (_, letter: string) => ` ${letter.toLowerCase()}m`);
}

/** "13 Oct 2026, 2:30 pm" */
export function formatDateTime(value: Date | string): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

/** Calendar day in EAT as "YYYY-MM-DD", used for daily report buckets. */
export function eatDayKey(value: Date | string): string {
  return dayKeyFormat.format(toDate(value));
}
