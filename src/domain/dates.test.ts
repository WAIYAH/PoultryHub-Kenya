import { describe, expect, it } from "vitest";

import { eatDayKey, formatDate, formatDateTime, formatShortDate, formatTime } from "./dates";

// 2026-10-13 11:30 UTC = 14:30 EAT (UTC+3)
const instant = "2026-10-13T11:30:00Z";

describe("EAT date formatting (KM-12)", () => {
  it("formats dates as 13 Oct 2026", () => {
    expect(formatDate(instant)).toBe("13 Oct 2026");
  });

  it("formats short dates with the weekday", () => {
    expect(formatShortDate(instant)).toBe("Tue, 13 Oct");
  });

  it("formats times in EAT with lowercase am/pm", () => {
    expect(formatTime(instant)).toBe("2:30 pm");
    expect(formatTime("2026-10-13T06:05:00Z")).toBe("9:05 am");
  });

  it("combines date and time", () => {
    expect(formatDateTime(instant)).toBe("13 Oct 2026, 2:30 pm");
  });

  it("rejects invalid dates", () => {
    expect(() => formatDate("not a date")).toThrow(RangeError);
  });
});

describe("eatDayKey", () => {
  it("rolls over to the next day at 21:00 UTC (midnight EAT)", () => {
    expect(eatDayKey("2026-10-13T20:59:59Z")).toBe("2026-10-13");
    expect(eatDayKey("2026-10-13T21:00:00Z")).toBe("2026-10-14");
  });
});
