export function normalizeBool(val: unknown): boolean {
  return typeof val === "string" ? val.toLowerCase() === "true" : val === true;
}
