import type { VulnCounts } from "~/types/nessus";
import type { FindingCounts } from "~/types/findings";
import type { ControlFindingCounts } from "~/types/controlFindings";

export type SystemEntry = {
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

type PolicyDocument = {
  id: number;
  title: string;
  version: string;
  creationDate: string;
  lastUpdate: string;
}
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

export type SctmEntry = {
  id: number;
  controlFamilyId: number;
  controlFamilyName: string | null;
  abbreviation: string;
  date: string;
  findings: ControlFindingCounts;
};

export type BoundarySumary = {
  boundaryInfo: {
    id: number;
    name: string;
    StigLibraryId: number;
    stigLibrary: string;
    PolicyDocumentId: number;
    PolicyDocument:  PolicyDocument | undefined;
    TierId: number;
    Tier: string | undefined;
  };
  boundaryView: StigEntry[];
  systemView: SystemEntry[];
  vulnView: VulnEntry[];
  sctmView: SctmEntry[];
  uniqueCounts: FindingCounts;
  totalCounts: FindingCounts;
  vulnUniqueCounts: VulnCounts;
  vulnTotalCounts: VulnCounts;
  auditCounts: ControlFindingCounts;
  assessorCounts: ControlFindingCounts;
};
