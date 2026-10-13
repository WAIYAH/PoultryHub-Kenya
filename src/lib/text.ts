/** Trims optional form text; blank or missing becomes null (how optional columns are stored). */
export function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? null : trimmed;
}
