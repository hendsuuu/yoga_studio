import { format } from "date-fns";

/**
 * Parse a schedule's date and timeRange into start/end Date objects.
 * timeRange format: "06.00 - 07.30" or "06:00 - 07:30"
 *
 * @param utcOffset — If provided (e.g. 7 for WIB/UTC+7), uses UTC-based
 *   calculation so the result is correct regardless of server timezone.
 *   Omit on the client side so the browser's local timezone is used.
 */
export function parseScheduleTimes(
  date: string | Date,
  timeRange: string,
  utcOffset?: number,
): { start: Date; end: Date } {
  const d = typeof date === "string" ? new Date(date) : date;
  const times = timeRange.split("-").map((t) => t.trim().replace(".", ":"));
  const [startH, startM] = times[0].split(":").map(Number);
  const [endH, endM] = (times[1] || times[0]).split(":").map(Number);

  const start = new Date(d);
  const end = new Date(d);

  if (utcOffset !== undefined) {
    start.setUTCHours(startH - utcOffset, startM, 0, 0);
    end.setUTCHours(endH - utcOffset, endM, 0, 0);
  } else {
    start.setHours(startH, startM, 0, 0);
    end.setHours(endH, endM, 0, 0);
  }

  return { start, end };
}

/** Format Date to Google Calendar UTC format: 20260416T060000Z */
function toGoogleDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** Generate Google Calendar deep link URL */
export function generateGoogleCalendarUrl(params: {
  title: string;
  start: Date;
  end: Date;
  coach: string;
  description?: string;
  location?: string;
}): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set(
    "dates",
    `${toGoogleDate(params.start)}/${toGoogleDate(params.end)}`,
  );
  url.searchParams.set(
    "details",
    params.description ||
      `Kelas yoga bersama ${params.coach}\n\nVirtual Studio - Premium Yoga Experience`,
  );
  if (params.location) url.searchParams.set("location", params.location);
  return url.toString();
}

/** Generate ICS file content string */
export function generateICS(params: {
  title: string;
  start: Date;
  end: Date;
  coach: string;
  description?: string;
  location?: string;
  uid?: string;
}): string {
  const formatICSDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const now = new Date();
  const uid =
    params.uid ||
    `${now.getTime()}-${Math.random().toString(36).slice(2)}@virtualstudio`;
  const description =
    params.description ||
    `Kelas yoga bersama ${params.coach}\\nVirtual Studio - Premium Yoga Experience`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Virtual Studio//Yoga Schedule//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(params.start)}`,
    `DTEND:${formatICSDate(params.end)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER;CN=${params.coach}:MAILTO:noreply@virtualstudio.app`,
    ...(params.location ? [`LOCATION:${params.location}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${params.title} dimulai 30 menit lagi`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
