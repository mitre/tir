export function limitExcelCell(input: string): string {
  if (!input) return "";

  let hasWrappingQuotes = false;

  if (input.startsWith('"') && input.endsWith('"')) {
    hasWrappingQuotes = true;
    input = input.slice(1, -1); // remove first and last quote
  }

  let truncated = input.slice(0, 32767);

  const lines = truncated.split("\n");
  if (lines.length > 254) {
    truncated = lines.slice(0, 254).join("\n");
  }

  if (hasWrappingQuotes) {
    return `"${truncated}"`;
  }

  return truncated;
}
