const STIG_CAT_TO_SEVERITY = {
  "CAT III": "low",
  "CAT II": "medium",
  "CAT I": "high",
} as const;
 
const SEVERITY_TO_STIG_CAT = Object.fromEntries(
  Object.entries(STIG_CAT_TO_SEVERITY).map(([cat, sev]) => [sev, cat])
) as {
  [V in typeof STIG_CAT_TO_SEVERITY[keyof typeof STIG_CAT_TO_SEVERITY]]:
    keyof typeof STIG_CAT_TO_SEVERITY;
};
 

export function stigCatToSeverity(stigCAT: string): string | null {
  return STIG_CAT_TO_SEVERITY[stigCAT as keyof typeof STIG_CAT_TO_SEVERITY] ?? null;
}
 
export function stigSeverityToCat(severity: string): string | null {
  return SEVERITY_TO_STIG_CAT[severity as keyof typeof SEVERITY_TO_STIG_CAT] ?? null;
}