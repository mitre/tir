import { DateTime } from "luxon";
import {
  Control,
  ControlNumber,
  ControlRevision,
  ControlRecord,
  ControlRecordItem,
  ControlFamily,
  ComplianceStatus,
  ControlStatement,
  ControlEnhancement,
  ControlEnhancementStatement,
  Boundary,
  Classification,
  PolicyDocument,
  CciReference,
  CciItem,
} from "../../db/models";

interface BaseFields {
  ControlRecordItemId: number;
  family: string;
  ComplianceStatusId: number;
  ImplementationStatusId: number;
  CommonControlProviderId: number;
  systemProvider: string;
  SecurityControlDesignationId: number;
  TestMethodId: number;
  naJustification: string;
  estimatedCompletionDate: string;
  implementationNarrative: string;
  responsibleEntities: string;
  criticality: string;
  FrequencyTypeId: number;
  ConMonMethodId: number;
  reporting: string;
  tracking: string;
  conmonComments: string;
  SeverityId: number;
  RelevanceOfThreatId: number;
  LikelihoodId: number;
  ImpactId: number;
  ResidualRiskLevelId: number;
  vulnerabilitySummary: string;
  mitigations: string;
  impactDescription: string;
  recommendations: string;
  auditor: string;
  AuditControlStatusId: number;
  auditDate: string;
  auditComments: string;
  assessor: string;
  AssessorControlStatusId: number;
  assessorDate: string;
  assessorComments: string;
  lastUpdate: string;
  creationDate: string;
}
interface ControlSummary extends BaseFields {
  type: "control";
  id: number;
  number: string;
  title: string;
  revision: string;
  guidance: string;
  statements: string[];
  cci: string;
  technicalAssessmentStatus: string;
  technicalAssessmentComments: string[];
}

interface EnhancementSummary extends BaseFields {
  type: "enhancement";
  id: number;
  number: string;
  title: string;
  revision: string;
  guidance: string;
  statements: string[];
  cci: string;
  technicalAssessmentStatus: string;
  technicalAssessmentComments: string[];
}
interface NewRecord {
  BoundaryId: number;
  ControlFamilyId: number;
  ControlRevisionId: number;
  lastUpdate: string;
  creationDate: string;
}

interface NewItem {
  ControlRecordId: number;
  ControlId: number;
  ComplianceStatusId: number;
  ControlEnhancementId?: number;
  AssessorControlStatusId: number;
  AuditControlStatusId: number;
  lastUpdate: string;
  creationDate: string;
}

interface InsertedControlRecord {
  id: number;
  ControlFamilyId: number;
}

export async function createControlRecords(BoundaryId: number, controlRev: string) {
  const revName = `rev${controlRev}`;
  const now = DateTime.now().toISO();

  const revision = await ControlRevision.findOne({
    where: { name: revName },
    attributes: ["id"],
  });
  if (!revision) {
    throw createError({
      statusCode: 404,
      statusMessage: `Control Revision ${revName} not found.`,
    });
  }

  const notReviewedStatus = await ComplianceStatus.findOne({
    where: { status: "Not Reviewed" },
    attributes: ["id"],
  });
  if (!notReviewedStatus) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Reviewed compliance status not found.",
    });
  }

  const controlFamilies = await ControlFamily.findAll({
    attributes: ["id"],
    include: [
      {
        model: Control,
        required: true,
        attributes: ["id", "ControlFamilyId"],
        include: [
          {
            model: ControlRevision,
            where: { id: revision.id },
            required: true,
            attributes: [],
          },
          {
            model: ControlEnhancement,
            attributes: ["id", "ControlId"],
          },
        ],
      },
    ],
  });

  const existingRecords = await ControlRecord.findAll({
    where: { BoundaryId, ControlRevisionId: revision.id },
    attributes: ["id", "ControlFamilyId"],
  });
  const existingRecordMap = new Map(existingRecords.map((r) => [r.ControlFamilyId, r.id]));

  const newRecords: NewRecord[] = [];
  const newItems: NewItem[] = [];

  for (const family of controlFamilies) {
    const recordId = existingRecordMap.get(family.id);
    if (!recordId) {
      newRecords.push({
        BoundaryId,
        ControlFamilyId: family.id,
        ControlRevisionId: revision.id,
        lastUpdate: now,
        creationDate: now,
      });
    }
  }

  try {
    await sequelize.transaction(async (t) => {
      let insertedRecords: InsertedControlRecord[] = [];
      if (newRecords.length > 0) {
        insertedRecords = await ControlRecord.bulkCreate(newRecords, {
          returning: ["id", "ControlFamilyId"],
          transaction: t,
        });
        insertedRecords.forEach((r) => existingRecordMap.set(r.ControlFamilyId, r.id));
      }

      for (const family of controlFamilies) {
        const recordId = existingRecordMap.get(family.id);
        if (!recordId) continue;
        const controls = family.Controls ?? [];
        for (const control of controls) {
          newItems.push({
            ControlRecordId: recordId,
            ControlId: control.id,
            ComplianceStatusId: notReviewedStatus.id,
            AssessorControlStatusId: notReviewedStatus.id,
            AuditControlStatusId: notReviewedStatus.id,
            lastUpdate: now,
            creationDate: now,
          });
          for (const enhancement of control.ControlEnhancements || []) {
            newItems.push({
              ControlRecordId: recordId,
              ControlId: control.id,
              ControlEnhancementId: enhancement.id,
              ComplianceStatusId: notReviewedStatus.id,
              AssessorControlStatusId: notReviewedStatus.id,
              AuditControlStatusId: notReviewedStatus.id,
              lastUpdate: now,
              creationDate: now,
            });
          }
        }
      }

      if (newItems.length > 0) {
        await ControlRecordItem.bulkCreate(newItems, { transaction: t });
      }
    });

    logger.info({
      service: "SCTM",
      message: `ControlRecords and items ensured for boundary ${BoundaryId} and revision ${revName}`,
    });
  } catch (err: any) {
    logger.error({
      service: "SCTM",
      message: `Failed to create control records for boundary ${BoundaryId} rev ${revName}`,
      error: err.message,
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create control records for boundary ${BoundaryId} rev ${revName}`,
    });
  }
}

function getBaseFields(item: any): BaseFields {
  return {
    ControlRecordItemId: item.id,
    family: item.Control.ControlFamily?.name || "",
    ComplianceStatusId: item.ComplianceStatusId,
    ImplementationStatusId: item.ImplementationStatusId,
    CommonControlProviderId: item.CommonControlProviderId,
    systemProvider: item.systemProvider,
    SecurityControlDesignationId: item.SecurityControlDesignationId,
    TestMethodId: item.TestMethodId,
    naJustification: item.naJustification,
    estimatedCompletionDate: item.estimatedCompletionDate,
    implementationNarrative: item.implementationNarrative,
    responsibleEntities: item.responsibleEntities,
    criticality: item.criticality,
    FrequencyTypeId: item.FrequencyTypeId,
    ConMonMethodId: item.ConMonMethodId,
    reporting: item.reporting,
    tracking: item.tracking,
    conmonComments: item.conmonComments,
    SeverityId: item.SeverityId,
    RelevanceOfThreatId: item.RelevanceOfThreatId,
    LikelihoodId: item.LikelihoodId,
    ImpactId: item.ImpactId,
    ResidualRiskLevelId: item.ResidualRiskLevelId,
    vulnerabilitySummary: item.vulnerabilitySummary,
    mitigations: item.mitigations,
    impactDescription: item.impactDescription,
    recommendations: item.recommendations,
    auditor: item.auditor,
    AuditControlStatusId: item.AuditControlStatusId,
    auditDate: item.auditDate,
    auditComments: item.auditComments,
    assessor: item.assessor,
    AssessorControlStatusId: item.AssessorControlStatusId,
    assessorDate: item.assessorDate,
    assessorComments: item.assessorComments,
    lastUpdate: item.lastUpdate,
    creationDate: item.creationDate,
  };
}

function getStandardControlSummary(
  item: any,
  cci: string,
  technicalAssessmentStatus: string,
  technicalAssessmentComments: string[],
): ControlSummary {
  const baseFields = getBaseFields(item);
  return {
    type: "control",
    id: item.Control.id,
    number: item.Control.ControlNumber?.number || "",
    title: item.Control.title,
    revision: item.Control.ControlRevision?.name || "",
    guidance: item.Control.guidance,
    statements: item.Control.ControlStatements || [],
    ...baseFields,
    cci,
    technicalAssessmentStatus,
    technicalAssessmentComments,
  };
}

function getEnhancementSummary(
  item: any,
  cci: string,
  technicalAssessmentStatus: string,
  technicalAssessmentComments: string[],
): EnhancementSummary {
  const baseFields = getBaseFields(item);
  return {
    type: "enhancement",
    id: item.ControlEnhancement.id,
    number: item.ControlEnhancement.enhancementIdentifier,
    title: item.ControlEnhancement.title,
    revision: "", // enhancements may not have a revision
    guidance: item.ControlEnhancement.guidance,
    statements: item.ControlEnhancement.ControlEnhancementStatements || [],
    ...baseFields,
    cci,
    technicalAssessmentStatus,
    technicalAssessmentComments,
  };
}

function evaluateStatuses(statusMap: Map<string, Set<string>>): string {
  if (!statusMap || statusMap.size === 0) {
    return "Not-Applicable";
  }

  const statuses = Array.from(statusMap.keys());
  if (statuses.some((status) => status.trim() === "Open")) {
    return "Non-Compliant";
  } else if (statuses.some((status) => status.trim() === "Not_Reviewed")) {
    return "Not Reviewed";
  } else if (statuses.some((status) => status.trim() === "NotAFinding")) {
    return "Compliant";
  } else if (statuses.some((status) => status.trim() === "Not_Applicable")) {
    return "Not-Applicable";
  } else {
    return "Not-Applicable";
  }
}

function buildDisplayLines(statusMap: Map<string, Set<string>>): string[] {
  const lines: string[] = [];
  for (const [status, vKeys] of statusMap) {
    lines.push(status, ...Array.from(vKeys), "");
  }
  return lines;
}

function determineCciStatus(cciVKeys: { vKey: string; status: string }[]): string {
  if (cciVKeys.some((cciVKey) => cciVKey.status === "Open")) {
    return "Non-Compliant";
  } else if (cciVKeys.some((cciVKey) => cciVKey.status === "Not_Reviewed")) {
    return "Not Reviewed";
  } else if (cciVKeys.some((cciVKey) => cciVKey.status === "NotAFinding")) {
    return "Compliant";
  } else {
    return "Not-Applicable";
  }
}

interface TechnicalAssessment {
  cci: string;
  technicalAssessmentStatus: string;
  technicalAssessmentComments: string[];
}

function getTechnicalAssessment(
  normalizedControlNumber: string,
  controlToStatusMap: Map<string, Map<string, Set<string>>>,
  cciMap: Map<string, string[]>,
  stigLookup: Record<string, { cciIds: Set<string>; stig: any }>,
): TechnicalAssessment {
  const statusMap = controlToStatusMap.get(normalizedControlNumber);
  const cciIds = cciMap.get(normalizedControlNumber) ?? [];

  if (!statusMap || statusMap.size === 0) {
    return {
      cci: "",
      technicalAssessmentStatus: "",
      technicalAssessmentComments: [
        "No applicable STIG mapping for this Control.",
      ],
    };
  }

  let cci = "";

  for (const cciId of cciIds) {
    const cciVKeys: { vKey: string; status: string }[] = [];

    for (const [status, vKeys] of statusMap) {
      for (const displayValue of vKeys) {
        const vKey = displayValue.split(" - ")[0];
        const stigEntry = stigLookup[vKey];

        if (stigEntry?.cciIds.has(cciId)) {
          cciVKeys.push({ vKey, status });
        }
      }
    }

    if (cciVKeys.length === 0) {
      continue;
    }

    const cciStatus = determineCciStatus(cciVKeys);
    cci += `  ${cciId}: ${cciStatus}\n`;
  }

  return {
    cci,
    technicalAssessmentStatus: evaluateStatuses(statusMap),
    technicalAssessmentComments: buildDisplayLines(statusMap),
  };
}

function parseTopLevelControl(raw: string): string {
  if (!raw) return "";

  const cleaned = raw.toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-Z]{2,3}-\d+)(\(\d+\))?/);

  return match
    ? match[1] + (match[2] ?? "")
    : cleaned;
}

async function loadCciItems(policyDocumentId: number | undefined) {
  return CciItem.findAll({
    attributes: ["cciId", "definition"],
    include: [
      {
        model: CciReference,
        attributes: ["index"],
        through: { attributes: [] },
        where: {
          PolicyDocumentId: policyDocumentId,
        },
      },
    ],
  });
}

function buildCciMaps(cciItems: Awaited<ReturnType<typeof loadCciItems>>) {
  const cciItemMap = new Map(
    cciItems.map((item) => [item.cciId, item]),
  );

  const cciMap = new Map<string, string[]>();

  for (const item of cciItems) {
    for (const reference of item.CciReferences ?? []) {
      if (!reference.index) continue;

      const controlNumber = parseTopLevelControl(reference.index);
      const mappedCcis = cciMap.get(controlNumber) ?? [];

      mappedCcis.push(item.cciId);
      cciMap.set(controlNumber, mappedCcis);
    }
  }

  return {
    cciItemMap,
    cciMap,
  };
}

export async function getControlSummary(
  BoundaryId: number,
  ControlRecordId: number,
): Promise<(ControlSummary | EnhancementSummary)[]> {
  const perfTimer = new PerfTimer();

  perfTimer.start("Query");
  const results = await ControlRecordItem.findAll({
    where: { ControlRecordId },
    include: [
      {
        model: ControlRecord,
        attributes: ["ControlFamilyId"],
        where: { BoundaryId },
        required: true,
        include: [{ model: ControlFamily, attributes: ["name"] }],
      },
      {
        model: Control,
        include: [
          { model: ControlNumber, attributes: ["number"], as: "ControlNumber" },
          { model: ControlRevision, attributes: ["name"], as: "ControlRevision" },
          { model: ControlStatement },
        ],
      },
      {
        model: ControlEnhancement,
        as: "ControlEnhancement",
        include: [
          {
            model: ControlEnhancementStatement,
            as: "ControlEnhancementStatements",
            foreignKey: "ControlEnhancementId",
          },
        ],
      },
    ],
    order: [
      [
        { model: ControlEnhancement, as: "ControlEnhancement" },
        { model: ControlEnhancementStatement, as: "ControlEnhancementStatements" },
        "id",
        "ASC",
      ],
      [
        { model: Control, as: "Control" },
        { model: ControlStatement, as: "ControlStatements" },
        "id",
        "ASC",
      ],
    ],
  });

  const boundary = await Boundary.findOne({
    where: { id: BoundaryId },
    include: [
      {
        model: Classification,
      },
      {
        model: PolicyDocument,
      },
    ],
  });

  const cciItems = await loadCciItems(
    boundary?.PolicyDocumentId,
  );

  const { cciItemMap, cciMap } = buildCciMaps(cciItems);

  const stigResults = await getEvaluationSummary(BoundaryId, undefined, false);

  const stigArray = Array.isArray(stigResults) ? stigResults : [stigResults];
  const controlToStatusMap = new Map<string, Map<string, Set<string>>>();
  const stigLookup: { [vKey: string]: { cciIds: Set<string>; stig: any } } = {};

  for (const stig of stigArray) {
    for (const stigData of stig.StigData) {
      for (const stigIdent of stigData.StigIdents) {
        const vKey = stigData.vuln_num;
        stigLookup[vKey] ??= { cciIds: new Set(), stig };
        stigLookup[vKey].cciIds.add(stigIdent.text);
      }
      const status = stigData.status;
      const vKey = stigData.vuln_num;
      const title = stig.title || "";
      const displayValue = title ? `${vKey} - ${title}` : vKey;

      const cciIds = stigData.StigIdents.map((c: any) => c.text);

      for (const cciId of cciIds) {
        const cciItem = cciItemMap.get(cciId);
        const cciReferences = cciItem?.CciReferences ?? [];

        for (const cciReference of cciReferences) {
          if (!cciReference.index) continue;

          const normalizedControl = parseTopLevelControl(
            cciReference.index,
          );

          if (!normalizedControl) continue;

          if (!controlToStatusMap.has(normalizedControl)) {
            controlToStatusMap.set(
              normalizedControl,
              new Map<string, Set<string>>(),
            );
          }

          const statusMap = controlToStatusMap.get(normalizedControl)!;

          if (!statusMap.has(status)) {
            statusMap.set(status, new Set<string>());
          }

          statusMap.get(status)!.add(displayValue);
        }
      }
    }
  }
  perfTimer.stop("Query");
  const controlSummaries: (ControlSummary | EnhancementSummary)[] =
    results.map((item) => {
      if (item.ControlEnhancementId && item.ControlEnhancement) {
        const normalizedControlNumber = parseTopLevelControl(
          item.ControlEnhancement.enhancementIdentifier,
        );

        const assessment = getTechnicalAssessment(
          normalizedControlNumber,
          controlToStatusMap,
          cciMap,
          stigLookup,
        );

        return getEnhancementSummary(
          item,
          assessment.cci,
          assessment.technicalAssessmentStatus,
          assessment.technicalAssessmentComments,
        );
      }

      if (item.Control?.ControlNumber) {
        const normalizedControlNumber = parseTopLevelControl(
          item.Control.ControlNumber.number,
        );

        const assessment = getTechnicalAssessment(
          normalizedControlNumber,
          controlToStatusMap,
          cciMap,
          stigLookup,
        );

        return getStandardControlSummary(
          item,
          assessment.cci,
          assessment.technicalAssessmentStatus,
          assessment.technicalAssessmentComments,
        );
      }

      throw new Error("ControlRecordItem without Control or Enhancement");
    });

  return controlSummaries;
}