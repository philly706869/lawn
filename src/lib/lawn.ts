import { data } from "#lib/data.ts";

export interface LawnWeek {
  year?: string;
  month?: string;
  days: LawnDay[];
}

export interface LawnDay {
  date: string;
  level: GrassLevel;
  href?: string;
}

export type GrassLevel = 0 | 1 | 2 | 3 | 4;

const day_in_ms = 86_400_000;

const get_grass_level = (size: number | undefined): GrassLevel => {
  if (size === undefined) return 0;
  if (size < 500) return 1;
  if (size < 700) return 2;
  if (size < 1000) return 3;
  return 4;
};

export const create_lawn = (grass: typeof data.grass, now: Date = new Date()): LawnWeek[] => {
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  let start = grass[0]?.date ?? today;
  let end = today;
  const records = new Map(grass.map((record) => [record.date, record]));

  for (const { date } of grass) {
    if (date < start) start = date;
    if (date > end) end = date;
  }

  // Only prepend earlier dates: first to the month's first day, then to Sunday.
  const start_date = new Date(`${start.slice(0, 7)}-01T00:00:00Z`);
  const start_time = start_date.getTime() - start_date.getUTCDay() * day_in_ms;
  const end_time = Date.parse(`${end}T00:00:00Z`);
  const weeks: LawnWeek[] = [];
  let previous_month: string | undefined;
  let previous_year: string | undefined;

  for (let week_time = start_time; week_time <= end_time; week_time += 7 * day_in_ms) {
    const days: LawnDay[] = [];
    for (
      let time = week_time;
      time <= Math.min(week_time + 6 * day_in_ms, end_time);
      time += day_in_ms
    ) {
      const date = new Date(time).toISOString().slice(0, 10);
      const record = records.get(date);
      days.push({
        date,
        level: get_grass_level(record?.size),
        ...(record ? { href: record.link } : {}),
      });
    }

    const first_day = days[0]!;
    const month = first_day.date.slice(0, 7);
    const week: LawnWeek = { days };
    if (week_time >= start_date.getTime() && month !== previous_month) {
      week.month = new Date(`${first_day.date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = first_day.date.slice(0, 4);
      if (year !== previous_year) {
        week.year = year;
        previous_year = year;
      }
    }
    weeks.push(week);
    previous_month = month;
  }

  return weeks;
};

export const weeks = create_lawn(data.grass);
