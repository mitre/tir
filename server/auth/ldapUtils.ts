export const UAC_ACCOUNT_DISABLED = 0x0002;

// RFC 4515 -- escape special characters in LDAP filter values
export function escapeFilter(value: string): string {
  return value
    .replaceAll("\\", String.raw`\5c`)
    .replaceAll("\0", String.raw`\00`)
    .replaceAll("(", String.raw`\28`)
    .replaceAll(")", String.raw`\29`)
    .replaceAll("*", String.raw`\2a`);
}

export function domainFromBaseDn(baseDn: string): string {
  return baseDn
    .split(",")
    .filter((p) => p.trim().toLowerCase().startsWith("dc="))
    .map((p) => p.trim().slice(3))
    .join(".");
}

export function firstAttr(val: unknown, fallback = ""): string {
  if (Array.isArray(val)) return (val[0] as string) || fallback;
  return (val as string) || fallback;
}

export function allAttrs(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  return val ? [val as string] : [];
}
