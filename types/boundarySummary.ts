import type { VulnCounts } from "~/types/nessus";
import type { FindingCounts } from "~/types/findings";

type SystemEntry = {
  id: number;
  name: string;
  stigsApplied: number[];
  findings: FindingCounts;
};

type StigEntry = {
  id: number;
  title: string;
  version: string;
  date: string;
  findings: FindingCounts;
};

export type CveEntry = {
  id: number;
  cveId: string;
};

export type NessusReportEntry = {
  id: number;
  pluginOutput: string;
  cvssTemporalScore?: number;
  cvss3TemporalScore?: number;
  severityOverride?: number;
  statusOverride?: string;
  NessusReport: {
    id: number;
    System: {
      id: number;
      name: string;
    };
  };
};

export type VulnEntry = {
  id: number;
  pluginId: number;
  pluginName: string;
  riskFactor: string;
  riskOverride: boolean;
  status: string;
  Cves: CveEntry[];
  NessusReportItems: NessusReportEntry[];
};

export type BoundarySumary = {
  boundaryInfo: {
    id: number;
    name: string;
    StigLibraryId: number;
    stigLibrary: string;
    PolicyDocumentId: number;
    TierId: number;
  };
  boundaryView: StigEntry[];
  systemView: SystemEntry[];
  vulnView: VulnEntry[];
  uniqueCounts: FindingCounts;
  totalCounts: FindingCounts;
  vulnUniqueCounts: VulnCounts;
  vulnTotalCounts: VulnCounts;
};
