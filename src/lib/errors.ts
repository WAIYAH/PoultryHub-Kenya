// Normalised application error (ARCHITECTURE.md §7.5, API_AND_INTEGRATIONS.md §6).
// The full code list grows with the features that raise them.
export type AppErrorCode =
  "VALIDATION_FAILED" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "NETWORK" | "INTERNAL";

const RETRYABLE: ReadonlySet<AppErrorCode> = new Set(["NETWORK", "INTERNAL"]);

export class AppError extends Error {
  readonly retryable: boolean;

  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.retryable = RETRYABLE.has(code);
  }
}

export function isRetryableError(error: unknown): boolean {
  return error instanceof AppError ? error.retryable : true;
}
