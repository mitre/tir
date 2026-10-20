import ExcelJS from "exceljs";
import { Boundary, Classification, ComplianceStatus, PolicyDocument } from "../../../db/models";
import { getControlSummary, type ControlSummaryRow } from "../controls";
import { formatDate } from "../datetime";
import {
  createFindingsWorkbook,
  emptyFindingsRow,
  FindingsColumns as Columns,
} from "./findingsWorkbook";

type RmfStatus = "Compliant" | "Non-Compliant" | "Not Reviewed" | "Not-Applicable";

function rollupStatus(statuses: (string | undefined)[]): RmfStatus {
  const anyMissing = statuses.some((status) => !status);
  if (statuses.includes("Non-Compliant")) return "Non-Compliant";
  if (statuses.includes("Not Reviewed") || anyMissing) return "Not Reviewed";
  if (statuses.includes("Compliant")) return "Compliant";
  return "Not-Applicable";
}

function byControlThenEnhancement(a: ControlSummaryRow, b: ControlSummaryRow): number {
  if (a.ControlId !== b.ControlId) return a.ControlId - b.ControlId;
  return (a.ControlEnhancementId ?? 0) - (b.ControlEnhancementId ?? 0);
}

function reviewSection(
  label: string,
  status: string | undefined,
  reviewer: string,
  date: string,
  comments: string,
) {
  return [`${label}: ${status ?? ""}`, reviewer, formatDate(date), comments]
    .filter(Boolean)
    .join("\n");
}

export async function generateRmfFindings(boundaryId: number): Promise<ExcelJS.Workbook> {
  const { workbook, sheet } = createFindingsWorkbook({
    [Columns.cci]: 30,
    [Columns.findingDetails]: 70,
  });

  const boundary = await Boundary.findOne({
    where: { id: boundaryId },
    include: [{ model: Classification }, { model: PolicyDocument }],
  });
  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `No Boundary found for id: ${boundaryId}.`,
    });
  }

  const complianceStatuses = await ComplianceStatus.findAll();
  const complianceStatusMap = new Map(complianceStatuses.map((d) => [d.id, d.status]));

  const summaries = (await getControlSummary(boundaryId)).sort(byControlThenEnhancement);
  const rmfArray: string[][] = [];

  for (const summary of summaries) {
    if (!summary.hasStigMapping) continue;

    const auditStatus = complianceStatusMap.get(summary.AuditControlStatusId);
    const assessorStatus = complianceStatusMap.get(summary.AssessorControlStatusId);
    const rowStatus = rollupStatus([
      summary.technicalAssessmentStatus,
      auditStatus,
      assessorStatus,
    ]);
    if (rowStatus === "Compliant" || rowStatus === "Not-Applicable") continue;

    const statements = summary.statements.map((s) => s.description).join("\n");
    const newRow = emptyFindingsRow();
    newRow[Columns.itemId] = (rmfArray.length + 1).toString();
    newRow[Columns.securityKey] = summary.number;
    newRow[Columns.systemsAffected] = boundary.name || "N/A";
    newRow[Columns.control] = summary.controlTitle ? `Control Title: ${summary.controlTitle}` : "";
    newRow[Columns.cci] = summary.cci;
    newRow[Columns.source] = boundary.PolicyDocument?.title || "N/A";
    newRow[Columns.vuln] = statements ? `Control Information: ${statements}` : "";
    newRow[Columns.status] = rowStatus;
    newRow[Columns.findingDetails] = [
      `Technical Assessment Status: ${summary.technicalAssessmentStatus}`,
      `Finding Status:\n${summary.technicalAssessmentComments.join("\n")}`,
      reviewSection(
        "Audit Status",
        auditStatus,
        summary.auditor,
        summary.auditDate,
        summary.auditComments,
      ),
      reviewSection(
        "Assessment Status",
        assessorStatus,
        summary.assessor,
        summary.assessorDate,
        summary.assessorComments,
      ),
    ].join("\n\n");
    newRow[Columns.mitigations] = summary.mitigations || "";
    newRow[Columns.recommendations] = summary.recommendations || "";

    rmfArray.push(newRow);
  }

  let classificationString = `${boundary.Classification?.name}`;
  if (boundary.caveats) {
    classificationString += `// ${boundary.caveats}`;
  }
  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;

  sheet.insertRows(2, rmfArray, "o");

  return workbook;
}
