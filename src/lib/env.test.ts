import { describe, expect, it } from "vitest";

import { ConfigError, parseEnv } from "./env";

function problemsFor(source: Record<string, unknown>): string[] {
  try {
    parseEnv(source);
    return [];
  } catch (error) {
    if (error instanceof ConfigError) return error.problems;
    throw error;
  }
}

describe("parseEnv (ARCHITECTURE.md §7.6)", () => {
  it("applies development defaults", () => {
    expect(parseEnv({})).toEqual({
      VITE_APP_ENV: "development",
      VITE_SITE_URL: "http://localhost:5173",
      VITE_DATA_SOURCE: "mock",
      VITE_SUPABASE_URL: undefined,
      VITE_SUPABASE_PUBLISHABLE_KEY: undefined,
      VITE_TURNSTILE_SITE_KEY: undefined,
    });
  });

  it("treats empty strings as unset", () => {
    expect(
      parseEnv({ VITE_SUPABASE_URL: "", VITE_TURNSTILE_SITE_KEY: "  " }).VITE_SUPABASE_URL,
    ).toBeUndefined();
  });

  it("refuses a secret key in a VITE_ variable, without echoing it", () => {
    const problems = problemsFor({ VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc123" });
    expect(problems.join(" ")).toContain("SECRET key");
    expect(problems.join(" ")).not.toContain("abc123");
  });

  it("requires Supabase settings when the Supabase data source is selected", () => {
    const problems = problemsFor({ VITE_DATA_SOURCE: "supabase" });
    expect(problems).toHaveLength(2);
  });

  it("refuses mock data in production (AC-12)", () => {
    expect(problemsFor({ VITE_APP_ENV: "production", VITE_DATA_SOURCE: "mock" })).toHaveLength(1);
  });

  it("rejects invalid enums and URLs", () => {
    const problems = problemsFor({ VITE_APP_ENV: "prod", VITE_SITE_URL: "example.com" });
    expect(problems).toEqual([
      "VITE_APP_ENV must be development, staging or production.",
      "VITE_SITE_URL must be an absolute http(s) URL.",
    ]);
  });
});
