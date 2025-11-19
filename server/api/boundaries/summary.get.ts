import { Op } from "sequelize";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  EvaluationItem,
  Override,
  Stig,
  StigData,
  StigLibrary,
  System,
  Boundary_User,
  Evaluation,
  ControlRecord,
  ControlRecordItem,
  ControlFamily,
  Control,
  ControlNumber,
  ControlRevision,
} from "../../../db/models";
import { initializeCounts } from "../../utils/findings";
import { PerfTimer } from "../../utils/perfTimer";
import { createControlRecords } from "../../utils/controls";
import { decodeToken } from "../../utils/currentUser";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Cve } from "~/db/models/cve";
import { NessusReport } from "~/db/models/nessusReport";
import {
  BoundarySumary,
  CveEntry,
  NessusReportEntry,
  VulnEntry,
  SctmEntry,
} from "~/types/boundarySummary";
import { VulnCounts } from "~/types/nessus";
import { FindingCounts } from "~/types/findings";
import { ControlFindingCounts } from "~/types/controlFindings";
import { Tier } from "~/db/models/tier";
import { PolicyDocument } from "~/db/models/policyDocument";
import { StigOverride } from "~/db/models/stigOverride";

export default defineEventHandler(async (event) => {
  const perfTimer = new PerfTimer();
  const query = getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }

  const checkResult = await userCheck(event, undefined, query.BoundaryId.toString(), undefined);

  const BoundaryId = parseInt(query.BoundaryId?.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const boundary = await Boundary.findOne({
    include: [
      {
        model: System,
        include: [
          {
            model: Stig,
            attributes: ["id", "title", "version", "stigRelease", "stigDate"],
            include: [
              {
                model: Evaluation,
                attributes: ["id", "lastUpdate"],
                where: { BoundaryId: query.BoundaryId },
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: StigLibrary,
      },
      {
        model: Boundary_User,
      },
      {
        model: Tier,
      },
      {
        model: PolicyDocument,
      },
      {
        model: ControlRecord,
        include: [
          {
            model: ControlRecordItem,
            attributes: ["ComplianceStatusId", "AuditControlStatusId", "AssessorControlStatusId"],
          },
          {
            model: ControlFamily,
            attributes: ["id", "name"],
            include: [
              {
                model: Control,
                include: [ControlNumber],
                limit: 1, // only need one to extract abbreviation
              },
            ],
          },
        ],
      },
    ],
    where: {
      id: BoundaryId,
    },
  });
  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `Boundary not Found. BoundaryId: ${query.BoundaryId}`,
    });
  }
  if (!boundary.StigLibrary) {
    throw createError({
      statusCode: 400,
      statusMessage: `Boundary does not have a Stig Library Associated.`,
    });
  }

  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Permission Not Granted. Not a member of this Enclave",
    });
  }

  if (query.authOnly) {
    return {
      status: "success",
      code: 200,
      message: "User is Authorized.",
    };
  }

  const boundaryInfo = {
    id: boundary.id,
    name: boundary.name,
    StigLibraryId: boundary.StigLibrary.id,
    stigLibrary: boundary.StigLibrary.filename,
    PolicyDocumentId: boundary.PolicyDocumentId,
    PolicyDocument: boundary.PolicyDocument,
    TierId: boundary.TierId,
    Tier: boundary.Tier?.name,
  };

  const allFindingsOrdered = await StigData.findAll({
    attributes: ["id"],
    include: [
      {
        model: AssessmentItem,
        attributes: ["status", "statusOverride", "severityOverride"],
        required: true,
        include: [
          {
            model: Assessment,
            attributes: ["SystemId"],
            required: true,
            where: { succeededByAssessmentId: { [Op.is]: null } },
            include: [
              {
                model: System,
                attributes: ["name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    required: true,
                    where: {
                      id: BoundaryId,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: Stig,
        attributes: ["id"],
        include: [
          {
            model: StigLibrary,
            where: { id: boundary.StigLibrary.id },
            required: true,
          },
        ],
      },
    ],
  });

  const vulnSummary = await NessusPlugin.findAll({
    attributes: ["id", "pluginId", "pluginName", "riskFactor"],
    include: [
      { model: Cve, attributes: ["id", "cveId"], required: true, through: { attributes: [] } },
      {
        model: NessusReportItem,
        attributes: [
          "id",
          "pluginOutput",
          "cvssTemporalScore",
          "cvss3TemporalScore",
          "statusOverride",
          "severityOverride",
        ],
        required: true,
        include: [
          {
            model: NessusReport,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: System,
                attributes: ["id", "name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    where: { id: BoundaryId },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const overrides = await Override.findAll({
    include: {
      model: System,
      where: {
        BoundaryId,
      },
    },
  });

  const stigOverrides = await StigOverride.findAll({
    where: { type: "status" },
    include: {
      model: System,
      where: {
        BoundaryId,
      },
    },
  });

  type SystemEntry = {
    id: number;
    name: string;
    stigsApplied: number[];
    override: boolean;
    findings: FindingCounts;
  };

  type StigEntry = {
    id: number;
    title: string;
    version: string;
    date: string;
    lastUpdate: string;
    findings: FindingCounts;
  };

  let tempCounts = initializeCounts();
  const uniqueCounts = initializeCounts();
  const totalCounts = initializeCounts();

  const boundaryView: StigEntry[] = [];
  const systemView: SystemEntry[] = [];

  for (let i = 0; i < allFindingsOrdered.length; i++) {
    const uniqueFinding = allFindingsOrdered[i];
    if (!uniqueFinding.AssessmentItems) {
      uniqueFinding.AssessmentItems = [];
    }

    if (!uniqueFinding.Stigs) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unable to find associated Stig for StigDataId: ${uniqueFinding.id}.`,
      });
    }

    if (!uniqueFinding.Stigs[0] || !uniqueFinding.Stigs[0].id) {
      break;
    }

    for (let j = 0; j < uniqueFinding.AssessmentItems.length; j++) {
      const assessmentItem = uniqueFinding.AssessmentItems[j];
      const assessment = assessmentItem.Assessment!;
      let override = false;
      if (assessmentItem.statusOverride) {
        override = true;
      }
      const status = assessmentItem.statusOverride || assessmentItem.status;
      const rawStatus = assessmentItem.status;

      perfTimer.start("Findings Map");
      const currentFinding = {
        Open: status === "Open" ? 1 : 0,
        NotAFinding: status === "NotAFinding" ? 1 : 0,
        Not_Reviewed: status === "Not_Reviewed" ? 1 : 0,
        Not_Applicable: status === "Not_Applicable" ? 1 : 0,
      };

      const rawFinding = {
        Open: rawStatus === "Open" ? 1 : 0,
        NotAFinding: rawStatus === "NotAFinding" ? 1 : 0,
        Not_Reviewed: rawStatus === "Not_Reviewed" ? 1 : 0,
        Not_Applicable: rawStatus === "Not_Applicable" ? 1 : 0,
      };
      perfTimer.stop("Findings Map");
      addFindings(tempCounts, currentFinding);
      addFindings(totalCounts, currentFinding);

      if (!assessment.System) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing assessment for AssessmentItemID: ${assessmentItem.id}.`,
        });
      }

      findOrAddSystemById(
        assessment.SystemId,
        assessment.System.name,
        override,
        uniqueFinding.Stigs[0].id,
        rawFinding,
      );
    }

    addFindings(uniqueCounts, uniqueTransformCounts(tempCounts));
    findOrAddStigById(uniqueFinding.Stigs[0].id, uniqueTransformCounts(tempCounts));

    tempCounts = initializeCounts();
  }

  const stigDetails = [];

  if (boundary && boundary.Systems) {
    for (const system of boundary.Systems) {
      if (system.Stigs) {
        if (system.Stigs.length === 0) {
          findOrAddSystemById(system.id, system.name, false);
        }
        for (const stig of system.Stigs) {
          findOrAddSystemById(system.id, system.name, false, stig.id);
          stigDetails.push(stig);
        }
      }
    }
  }

  for (let i = 0; i < boundaryView.length; i++) {
    const details = stigDetails.find((stigDetail) => stigDetail.id === boundaryView[i].id);
    if (details) {
      boundaryView[i].title = details.title;
      boundaryView[i].version = `v${details.version}r${details.stigRelease}`;
      boundaryView[i].date = details.stigDate;
      if (details.Evaluations[0]) {
        boundaryView[i].lastUpdate = details.Evaluations[0].lastUpdate;
      }
    }
  }

  const severityToValue = {
    None: 0,
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

  const valueToSeverity = {
    0: "None",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
  };

  const vulnView: VulnEntry[] = [];
  const notOpenVulns: VulnEntry[] = [];
  const vulnUniqueCounts: VulnCounts = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 };
  const vulnTotalCounts: VulnCounts = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 };

  for (let i = 0; i < vulnSummary.length; i++) {
    const cvesInVuln: CveEntry[] = [];
    const nessusReportItems: NessusReportEntry[] = [];
    const statusSummary = initializeCounts();
    let severitySummary: number = severityToValue[vulnSummary[i].riskFactor];
    let severityOverriden = false;

    for (const reportItem of vulnSummary?.[i]?.NessusReportItems || []) {
      const reportEntry: NessusReportEntry = {
        id: reportItem.id,
        pluginOutput: reportItem.pluginOutput,
        cvss3TemporalScore: reportItem.cvss3TemporalScore,
        cvssTemporalScore: reportItem.cvssTemporalScore,
        severityOverride: reportItem.severityOverride,
        statusOverride: reportItem.statusOverride,
        NessusReport: {
          id: reportItem.NessusReportId,
          System: {
            id: reportItem.NessusReport!.System!.id,
            name: reportItem.NessusReport!.System!.name,
          },
        },
      };
      if (reportItem.statusOverride) {
        const currentFinding = {
          Open: reportItem.statusOverride === "Open" ? 1 : 0,
          NotAFinding: reportItem.statusOverride === "NotAFinding" ? 1 : 0,
          Not_Reviewed: reportItem.statusOverride === "Not_Reviewed" ? 1 : 0,
          Not_Applicable: reportItem.statusOverride === "Not_Applicable" ? 1 : 0,
        };
        addFindings(statusSummary, currentFinding);
      }

      if (reportItem.severityOverride) {
        if (severityOverriden) {
          if (reportItem.severityOverride > severitySummary) {
            severitySummary = reportItem.severityOverride;
          }
        } else {
          severityOverriden = true;
          severitySummary = reportItem.severityOverride;
        }
      }
      nessusReportItems.push(reportEntry);
    }

    for (const cve of vulnSummary?.[i]?.Cves || []) {
      const cveEntry: CveEntry = {
        id: cve.id,
        cveId: cve.cveId,
      };
      cvesInVuln.push(cveEntry);
    }

    const vulnItem: VulnEntry = {
      id: vulnSummary[i].id,
      pluginId: vulnSummary[i].pluginId,
      pluginName: vulnSummary[i].pluginName,
      riskFactor: valueToSeverity[severitySummary],
      riskOverride: severityOverriden,
      status: uniqueTransform(statusSummary),
      Cves: cvesInVuln,
      NessusReportItems: nessusReportItems,
    };

    if (vulnItem.status === "Open") {
      addSingleCount(vulnUniqueCounts, vulnItem.riskFactor, 1);

      addSingleCount(
        vulnTotalCounts,
        vulnItem.riskFactor,
        vulnSummary?.[i]?.NessusReportItems?.length ?? 0,
      );

      vulnView.push(vulnItem);
    } else {
      notOpenVulns.push(vulnItem);
    }
  }

  vulnView.push(...notOpenVulns);

  const sctmView: SctmEntry[] = [];
  const auditCounts: ControlFindingCounts = {
    Compliant: 0,
    Non_Compliant: 0,
    Not_Applicable: 0,
    Not_Reviewed: 0,
  };

  const assessorCounts: ControlFindingCounts = {
    Compliant: 0,
    Non_Compliant: 0,
    Not_Applicable: 0,
    Not_Reviewed: 0,
  };
  const revName = `rev${boundary.PolicyDocument.version}`;
  const revision = await ControlRevision.findOne({ where: { name: revName } });

  let controlRecords: any[] = [];
  if (revision) {
    controlRecords = (boundary?.ControlRecords || []).filter(
      (cr: any) => cr.ControlRevisionId === revision.id,
    );
  } else {
    logger.info({
      service: "SCTM",
      message: `Revision ${revName} not found. Skipping ControlRecord filtering/creation...`,
    });
  }

  if (revision && !controlRecords?.length && boundary?.PolicyDocument?.version) {
    // Create new ControlRecords
    await createControlRecords(boundary.id, boundary.PolicyDocument.version);

    // Reload the boundary's ControlRecords after creation
    const refreshedBoundary = await Boundary.findByPk(boundary.id, {
      include: [
        {
          model: ControlRecord,
          include: [
            {
              model: ControlRecordItem,
              attributes: ["ComplianceStatusId", "AuditControlStatusId", "AssessorControlStatusId"],
            },
            {
              model: ControlFamily,
              attributes: ["id", "name"],
              include: [
                {
                  model: Control,
                  include: [ControlNumber],
                  limit: 1, // only need one to extract abbreviation
                },
              ],
            },
          ],
        },
      ],
    });
    controlRecords = (refreshedBoundary?.ControlRecords || []).filter(
      (cr: any) => cr.ControlRevisionId === revision.id,
    );
  }

  // Populate sctmView
  for (const record of controlRecords) {
    const family = record.ControlFamily;
    const counts: ControlFindingCounts = {
      Compliant: 0,
      Non_Compliant: 0,
      Not_Applicable: 0,
      Not_Reviewed: 0,
    };

    if (record.ControlRecordItems && record.ControlRecordItems.length) {
      for (const item of record.ControlRecordItems) {
        switch (item.ComplianceStatusId) {
          case 1:
            counts.Compliant += 1;
            break;
          case 2:
            counts.Non_Compliant += 1;
            break;
          case 3:
            counts.Not_Applicable += 1;
            break;
          case 4:
            counts.Not_Reviewed += 1;
            break;
        }
        switch (item.AuditControlStatusId) {
          case 1:
            auditCounts.Compliant += 1;
            break;
          case 2:
            auditCounts.Non_Compliant += 1;
            break;
          case 3:
            auditCounts.Not_Applicable += 1;
            break;
          case 4:
            auditCounts.Not_Reviewed += 1;
            break;
        }
        switch (item.AssessorControlStatusId) {
          case 1:
            assessorCounts.Compliant += 1;
            break;
          case 2:
            assessorCounts.Non_Compliant += 1;
            break;
          case 3:
            assessorCounts.Not_Applicable += 1;
            break;
          case 4:
            assessorCounts.Not_Reviewed += 1;
            break;
        }
      }
    }

    const abbreviation = family?.Controls?.[0]?.ControlNumber?.number?.split("-")[0] ?? "N/A";

    const sctmEntry: SctmEntry = {
      id: record.id,
      controlFamilyId: record.ControlFamilyId,
      controlFamilyName: family?.name ?? "Unknown",
      abbreviation,
      date: record.lastUpdate,
      findings: counts,
    };
    sctmView.push(sctmEntry);
  }

  perfTimer.globalSummaryPrint();
  const boundarySummary: BoundarySumary = {
    boundaryInfo,
    boundaryView,
    systemView,
    vulnView,
    sctmView,
    uniqueCounts,
    totalCounts,
    vulnTotalCounts,
    vulnUniqueCounts,
    auditCounts,
    assessorCounts,
  };

  return boundarySummary;

  function findOrAddSystemById(
    id: number,
    name: string,
    override: boolean,
    stigId?: number,
    findings?: FindingCounts,
  ): void {
    const existingSystem = systemView.find((systemEntry) => systemEntry.id === id);
    let targetSystem: SystemEntry;

    if (!existingSystem) {
      targetSystem = {
        id,
        name,
        override,
        stigsApplied: [],
        findings: initializeCounts(),
      };
    } else {
      targetSystem = existingSystem;
    }

    if (findings) {
      addFindings(targetSystem.findings, findings);
    }

    if (stigId) {
      const existingStig = targetSystem.stigsApplied.find((id) => id === stigId);
      if (!existingStig) {
        targetSystem.stigsApplied.push(stigId);
      }
    }
    if (override) {
      targetSystem.override = true;
    }

    if (!existingSystem) {
      systemView.push(targetSystem);
    }
  }

  function findOrAddStigById(id: number, findings: FindingCounts): void {
    const existingSystem = boundaryView.find((stigEntry) => stigEntry.id === id);

    if (existingSystem) {
      addFindings(existingSystem.findings, findings);
    } else {
      const newStig: StigEntry = {
        id,
        title: "",
        version: "",
        date: "",
        lastUpdate: "",
        findings,
      };
      boundaryView.push(newStig);
    }
  }

  function addFindings(targetSum: FindingCounts, addends: FindingCounts) {
    for (const key in addends) {
      if (Object.prototype.hasOwnProperty.call(addends, key)) {
        targetSum[key] += addends[key];
      }
    }
  }

  function addCounts<T extends { [key: string]: number }>(count1: T, count2: T): T {
    const result = {} as T;

    (Object.keys(count1) as (keyof T)[]).forEach((key) => {
      result[key] = (count1[key] + count2[key]) as T[keyof T];
    });

    return result;
  }

  function addCountsSafe<T extends { [key: string]: number }>(count1: T, count2: T): T {
    const result = {} as T;

    const allKeys = new Set([...Object.keys(count1), ...Object.keys(count2)]);

    allKeys.forEach((key) => {
      result[key as keyof T] = ((count1[key] || 0) + (count2[key] || 0)) as T[keyof T];
    });

    return result;
  }

  function addSingleCount<T extends { [key: string]: number }>(
    target: T,
    key: keyof T,
    value: number,
  ): void {
    target[key] = ((target[key] || 0) + value) as T[keyof T];
  }
});
