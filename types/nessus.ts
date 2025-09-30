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
