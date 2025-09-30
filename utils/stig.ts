export function catSeverityToStig(catSeverity) {
  const severityMap = {
    "CAT I": "high",
    "CAT II": "medium",
    "CAT III": "low",
  };

  return severityMap[catSeverity] || null;
}

export function stigSeverityToCat(stigSeverity) {
  const severityMap = {
    high: "CAT I",
    medium: "CAT II",
    low: "CAT III",
  };

  return severityMap[stigSeverity] || null;
}
