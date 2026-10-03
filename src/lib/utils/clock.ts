/**
 * "Nu" in Nederlandse tijd, voor de rooster- en openingstijdenregels.
 *
 * De regels in domain/ vergelijken kalenderdagen en kloktijden uit de zaak
 * (altijd Nederlandse tijd) met `nu`. Een serverless host draait in UTC; zonder
 * deze omrekening zou een slot van 10:00 twee uur te vroeg of te laat als
 * "verleden" gelden. De teruggegeven Date is bewust een "muurklok-datum": de
 * lokale velden (getHours, getDate, …) tonen de Nederlandse tijd, precies zoals
 * de domeinregels ze lezen.
 */
export function nuInAmsterdam(nu: Date = new Date()): Date {
  const delen = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(nu);

  // "2026-09-08 10:15:00" → zonder tijdzone geparsed = lokale velden.
  return new Date(delen.replace(" ", "T"));
}
