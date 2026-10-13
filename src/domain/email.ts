// Email addresses: a light shape check only. The mail provider is the real test (a confirmation
// link for accounts, ACC-01), so this stays permissive.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "jane@example.com" → true; "jane@example" → false. Surrounding spaces are ignored. */
export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}
