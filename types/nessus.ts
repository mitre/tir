export type NessusMatch = {
  SystemId: number;
  NessusHostName: string;
};

export type VulnCounts = {
  [key: string]: number;
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
  None: number;
};

export enum NessusPluginTypes {
  Combined = "combined",
  Local = "local",
  Remote = "remote",
  Summary = "summary",
}

export const NessusCsvHeaders = {
  PluginId: "Plugin ID",
  CVE: "CVE",
  CvssV2: "CVSS v2.0 Base Score",
  CvssV3: "CVSS v3_0 Base Score",
  Risk: "Risk",
  Host: "Host",
  Protocol: "Protocol",
  Port: "Port",
  Name: "Name",
  Synopsis: "Synopsis",
  Description: "Description",
  Solution: "Solution",
  SeeAlso: "See Also",
  PluginOutput: "Plugin Output",
} as const;

export type HeaderLabel = (typeof NessusCsvHeaders)[keyof typeof NessusCsvHeaders];
