// Normalised application error (ARCHITECTURE.md §7.5, API_AND_INTEGRATIONS.md §6).
// Every service error becomes an AppError; `errorCopy` is the single map from code to the
// customer-facing message.
export type AppErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "CAPTCHA_FAILED"
  | "NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "EMAIL_IN_USE"
  | "PRICE_CHANGED"
  | "INSUFFICIENT_STOCK"
  | "QUANTITY_RULE"
  | "AREA_NOT_SERVED"
  | "BELOW_MINIMUM_ORDER"
  | "PAYMENT_METHOD_UNAVAILABLE"
  | "PROMO_INVALID"
  | "ORDER_NOT_PAYABLE"
  | "PAYMENT_IN_PROGRESS"
  | "NOT_CANCELLABLE"
  | "IDEMPOTENCY_CONFLICT"
  | "TOO_MANY_OPEN_ORDERS"
  | "INVALID_PHONE"
  | "PAYMENTS_DISABLED"
  | "PROVIDER_UNAVAILABLE"
  | "NETWORK"
  | "INTERNAL";

const RETRYABLE: ReadonlySet<AppErrorCode> = new Set([
  "NETWORK",
  "INTERNAL",
  "PROVIDER_UNAVAILABLE",
]);

export class AppError extends Error {
  readonly retryable: boolean;

  constructor(
    readonly code: AppErrorCode,
    message: string = errorCopy(code),
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.retryable = RETRYABLE.has(code);
  }
}

export function isAppError(error: unknown, code?: AppErrorCode): error is AppError {
  return error instanceof AppError && (code === undefined || error.code === code);
}

export function isRetryableError(error: unknown): boolean {
  return error instanceof AppError ? error.retryable : true;
}

const COPY: Record<AppErrorCode, string> = {
  VALIDATION_FAILED: "Please check the highlighted fields.",
  UNAUTHENTICATED: "Please sign in again.",
  FORBIDDEN: "You don't have access to this.",
  CAPTCHA_FAILED: "Please complete the security check again.",
  NOT_FOUND: "We couldn't find that. Check the details and try again.",
  INVALID_CREDENTIALS: "That email and password don't match an account.",
  EMAIL_NOT_CONFIRMED: "Please confirm your email address first. Check your inbox for the link.",
  EMAIL_IN_USE: "An account with this email already exists. Sign in instead.",
  PRICE_CHANGED: "Some prices changed. Please review your order.",
  INSUFFICIENT_STOCK: "Some items don't have enough stock. We've updated your order.",
  QUANTITY_RULE: "Some quantities don't match how the item is sold.",
  AREA_NOT_SERVED: "We don't deliver there yet. Choose pick-up or chat with us on WhatsApp.",
  BELOW_MINIMUM_ORDER: "Delivery to this area needs a larger order.",
  PAYMENT_METHOD_UNAVAILABLE: "That payment method isn't available for this order.",
  PROMO_INVALID: "This promo code can't be used.",
  ORDER_NOT_PAYABLE: "This order doesn't need payment.",
  PAYMENT_IN_PROGRESS: "Check your phone: we've already sent a prompt.",
  NOT_CANCELLABLE: "This order can no longer be cancelled online. Please contact us.",
  IDEMPOTENCY_CONFLICT: "Something went wrong placing your order. Please try again.",
  TOO_MANY_OPEN_ORDERS: "You have unpaid orders waiting. Complete or cancel them first.",
  INVALID_PHONE: "Enter a Kenyan mobile number, e.g. 0712 345 678.",
  PAYMENTS_DISABLED: "M-Pesa is temporarily unavailable. Choose another payment method.",
  PROVIDER_UNAVAILABLE: "M-Pesa didn't respond. Try again or pay via Paybill.",
  NETWORK: "No connection. Check your network and try again.",
  INTERNAL: "Something went wrong on our side. Please try again.",
};

/** Customer-facing copy for an error code (API_AND_INTEGRATIONS.md §6). */
export function errorCopy(code: AppErrorCode): string {
  return COPY[code];
}

/** Best message to show for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return COPY.INTERNAL;
}
