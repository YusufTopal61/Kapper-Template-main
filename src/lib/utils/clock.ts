/**
 * "Now" in Dutch time, for the schedule and opening hours rules.
 *
 * The rules in domain/ compare calendar days and clock times of the business
 * (always Dutch time) with `now`. A serverless host runs in UTC; without this
 * conversion a 10:00 slot would count as "past" two hours too early or too
 * late. The returned Date is deliberately a "wall-clock date": its local
 * fields (getHours, getDate, …) show the Dutch time, exactly as the domain
 * rules read them.
 */
export function nowInAmsterdam(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(now);

  // "2026-09-08 10:15:00" → parsed without a time zone = local fields.
  return new Date(parts.replace(" ", "T"));
}
