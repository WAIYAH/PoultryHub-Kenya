// Validated, typed access to VITE_* configuration (ARCHITECTURE.md §7.6).
// Hand-written rather than Zod: this module loads on every page, and Zod would add ~22 KB gzip
// to the initial bundle (NFR-PERF-3). Only variable NAMES are reported; values are never printed.

export interface AppEnv {
  VITE_APP_ENV: "development" | "staging" | "production";
  VITE_SITE_URL: string;
  VITE_DATA_SOURCE: "mock" | "supabase";
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_TURNSTILE_SITE_KEY?: string;
}

export class ConfigError extends Error {
  constructor(readonly problems: string[]) {
    super(`Invalid configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ConfigError";
  }
}

function text(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T | null {
  if (value === undefined) return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export function parseEnv(source: Record<string, unknown>): AppEnv {
  const problems: string[] = [];

  const appEnv = oneOf(
    text(source, "VITE_APP_ENV"),
    ["development", "staging", "production"],
    "development",
  );
  if (appEnv === null) problems.push("VITE_APP_ENV must be development, staging or production.");

  const dataSource = oneOf(text(source, "VITE_DATA_SOURCE"), ["mock", "supabase"], "mock");
  if (dataSource === null) problems.push("VITE_DATA_SOURCE must be mock or supabase.");

  const siteUrl = text(source, "VITE_SITE_URL") ?? "http://localhost:5173";
  if (!isUrl(siteUrl)) problems.push("VITE_SITE_URL must be an absolute http(s) URL.");

  const supabaseUrl = text(source, "VITE_SUPABASE_URL");
  if (supabaseUrl !== undefined && !isUrl(supabaseUrl)) {
    problems.push("VITE_SUPABASE_URL must be an absolute http(s) URL.");
  }

  const publishableKey = text(source, "VITE_SUPABASE_PUBLISHABLE_KEY");
  if (publishableKey?.startsWith("sb_secret_")) {
    problems.push(
      "VITE_SUPABASE_PUBLISHABLE_KEY is a SECRET key. Never put a secret key in a VITE_ variable; use the publishable key.",
    );
  }

  if (dataSource === "supabase") {
    if (!supabaseUrl)
      problems.push("VITE_SUPABASE_URL is required when VITE_DATA_SOURCE=supabase.");
    if (!publishableKey) {
      problems.push("VITE_SUPABASE_PUBLISHABLE_KEY is required when VITE_DATA_SOURCE=supabase.");
    }
  }
  if (appEnv === "production" && dataSource === "mock") {
    problems.push(
      'VITE_DATA_SOURCE must be "supabase" in production; mock data is never shown to real customers.',
    );
  }

  if (problems.length > 0 || appEnv === null || dataSource === null)
    throw new ConfigError(problems);

  return {
    VITE_APP_ENV: appEnv,
    VITE_SITE_URL: siteUrl,
    VITE_DATA_SOURCE: dataSource,
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    VITE_TURNSTILE_SITE_KEY: text(source, "VITE_TURNSTILE_SITE_KEY"),
  };
}

let cached: AppEnv | undefined;

/** Reads and validates the build-time environment once. Throws ConfigError with variable names only. */
export function getEnv(): AppEnv {
  cached ??= parseEnv(import.meta.env);
  return cached;
}
