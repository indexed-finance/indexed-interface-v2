import { formatDistanceStrict } from "date-fns";

export const durationIn = {
  seconds: (n: number, unit: "ms" | "s" = "ms") =>
    n * (unit === "ms" ? 1000 : 1),
  minutes: (n: number, unit: "ms" | "s" = "ms") =>
    n * durationIn.seconds(60, unit),
  hours: (n: number, unit: "ms" | "s" = "ms") =>
    n * durationIn.minutes(60, unit),
  days: (n: number, unit: "ms" | "s" = "ms") => n * durationIn.hours(24, unit),
  weeks: (n: number, unit: "ms" | "s" = "ms") => n * durationIn.days(7, unit),
  years: (n: number, unit: "ms" | "s" = "ms") => n * durationIn.days(365, unit),
};

export const duration = (s: number) =>
  formatDistanceStrict(0, s * 1000, { unit: "day" });
