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
} from "../../db/models";

export interface ControlSummary {
  ControlRecordItemId: number;
  id: number; // controlId OR enhancementId
  number: string; // controlNumber OR enhancementIdentifier
  title: string;
  revision: string; // controls have it, enhancements can be blank
  guidance: string;
  statements: Array<any>; // ControlStatements OR ControlEnhancementStatements
  type: "control" | "enhancement";
}

export async function createControlRecords(BoundaryId: number, controlRev: string) {
  const revName = `rev${controlRev}`;
  const now = DateTime.now().toISO();
  // Get revision
  const revision = await ControlRevision.findOne({ where: { name: revName } });
  if (!revision) {
    console.warn(`Revision ${revName} not found. Skipping...`);
    return; // just exit the function early
  }

  // Default compliance status
  const notReviewedStatus = await ComplianceStatus.findOne({ where: { status: "Not Reviewed" } });
  if (!notReviewedStatus) throw new Error(`Not Reviewed compliance status not found`);

  // Get all control families with their controls + enhancements for this revision
  const controlFamilies = await ControlFamily.findAll({
    include: [
      {
        model: Control,
        required: true,
        include: [
          {
            model: ControlRevision,
            where: { id: revision.id },
            required: true,
          },
          {
            model: ControlEnhancement,
          },
        ],
      },
    ],
  });

  // Fetch existing ControlRecords for this boundary + revision to avoid duplicates
  const existingRecords = await ControlRecord.findAll({
    where: { BoundaryId, ControlRevisionId: revision.id },
    attributes: ["id", "ControlFamilyId"],
  });
  const existingRecordMap = new Map(existingRecords.map((r) => [r.ControlFamilyId, r.id]));

  const newRecords: any[] = [];
  const newItems: any[] = [];

  for (const family of controlFamilies) {
    const recordId = existingRecordMap.get(family.id);
    if (!recordId) {
      // Prepare new ControlRecord
      newRecords.push({
        BoundaryId,
        ControlFamilyId: family.id,
        ControlRevisionId: revision.id,
        lastUpdate: now,
        creationDate: now,
      });
    }
  }

  // Bulk insert new ControlRecords and get their IDs
  let insertedRecords: any[] = [];
  if (newRecords.length > 0) {
    try {
      insertedRecords = await ControlRecord.bulkCreate(newRecords, { returning: true });
      insertedRecords.forEach((r: any) => existingRecordMap.set(r.ControlFamilyId, r.id));
    } catch (err: any) {
      if (err.name === "SequelizeValidationError") {
        console.error(
          "Validation error messages:",
          err.errors.map((e: any) => e.message),
        );
        console.error(
          "Invalid fields:",
          err.errors.map((e: any) => e.path),
        );
      } else if (err.name === "SequelizeForeignKeyConstraintError") {
        console.error("Foreign key constraint error:", err.fields);
      } else {
        console.error("Unexpected error inserting ControlRecords:", err);
      }
    }
  }

  // Prepare ControlRecordItems
  for (const family of controlFamilies) {
    const recordId = existingRecordMap.get(family.id);
    if (!recordId) continue;
    const controls = family.Controls ?? [];
    for (const control of controls) {
      // Base control item
      newItems.push({
        ControlRecordId: recordId,
        ControlId: control.id,
        ComplianceStatusId: notReviewedStatus.id,
        AssessorControlStatusId: notReviewedStatus.id,
        AuditControlStatusId: notReviewedStatus.id,
        lastUpdate: now,
        creationDate: now,
      });

      // Enhancements
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

  // Optional: skip inserting if newItems is empty
  if (newItems.length > 0) {
    await ControlRecordItem.bulkCreate(newItems);
  }

  logger.info({
    service: "SCTM",
    message: `ControlRecords and items ensured for boundary ${BoundaryId} and revision ${revName}`,
  });
}

export async function getControlSummary(
  BoundaryId: number,
  ControlRecordId: number,
): Promise<ControlSummary[]> {
  const perfTimer = new PerfTimer();

  perfTimer.start("Query");
  const results = await ControlRecordItem.findAll({
    include: [
      {
        model: ControlRecord,
        attributes: ["ControlFamilyId"],
        where: { BoundaryId, id: ControlRecordId },
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
  perfTimer.stop("Query");
  const controlSummaries: ControlSummary[] = results.map((item) => {
    if (item.ControlEnhancementId && item.ControlEnhancement) {
      return {
        type: "enhancement",
        ControlRecordItemId: item.id,
        id: item.ControlEnhancement.id,
        family: item.ControlRecord?.ControlFamily?.name || "",
        number: item.ControlEnhancement.enhancementIdentifier,
        title: item.ControlEnhancement.title,
        revision: "", // enhancements may not have a revision
        guidance: item.ControlEnhancement.guidance,
        statements: item.ControlEnhancement.ControlEnhancementStatements || [],
        ...{
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
        },
      };
    }
    if (item.Control) {
      return {
        type: "control",
        ControlRecordItemId: item.id,
        id: item.Control.id,
        family: item.ControlRecord?.ControlFamily?.name || "",
        number: item.Control.ControlNumber?.number || "",
        title: item.Control.title,
        revision: item.Control.ControlRevision?.name || "",
        guidance: item.Control.guidance,
        statements: item.Control.ControlStatements || [],
        ...{
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
        },
      };
    }

    throw new Error("ControlRecordItem without Control or Enhancement");
  });
  return controlSummaries;
}
