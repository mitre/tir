import ExcelJS from "exceljs";
import { getVulnSummary } from "../vulnerabilities";
import { Boundary, CciItem, CciReference, User, Classification } from "~/db/models";
import { getIndexesByCciIds } from "~/server/utils/cci";
import { catFromSeverity } from "~/server/utils/findings";
import { getVulnSummary } from "../vulnerabilities";

export async function generatePoam(
  boundaryId: number,
  userId: number | undefined,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 80 }];

  sheet.columns = [
    {
      width: 12,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 18,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 19,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 16,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 21,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 38,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 30,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 34,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 27,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 29,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 35,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 35,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 36,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 32,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 37,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 27,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 41,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  sheet.mergeCells("A1:U1");
  sheet.mergeCells("A2:B2");
  sheet.mergeCells("A3:B3");
  sheet.mergeCells("A4:B4");
  sheet.mergeCells("A5:B5");
  sheet.mergeCells("A6:B6");
  sheet.mergeCells("C2:H2");
  sheet.mergeCells("C3:H3");
  sheet.mergeCells("C4:H4");
  sheet.mergeCells("C5:H5");
  sheet.mergeCells("C6:H6");
  sheet.mergeCells("I2:I3");
  sheet.mergeCells("J2:K3");
  sheet.mergeCells("J4:K4");
  sheet.mergeCells("J5:K5");
  sheet.mergeCells("J6:K6");
  sheet.mergeCells("L2:L3");
  sheet.mergeCells("M2:O3");
  sheet.mergeCells("L4:O4");
  sheet.mergeCells("M5:O5");
  sheet.mergeCells("L6:O6");
  sheet.mergeCells("P2:U6");

  const headers: string[] = [
    "POA&M Item ID",
    "Control Vulnerability Description",
    "Controls / APs",
    "Office/Org",
    "Security Checks",
    "Resources Required",
    "Scheduled Completion Date",
    "Milestone with Completion Dates",
    "Milestone Changes",
    "Source Identifying Vulnerability",
    "Status",
    "Comments",
    "Raw Severity",
    "Mitigations",
    "Severity",
    "Relevance of Threat",
    "Likelihood",
    "Impact",
    "Impact Description",
    "Residual Risk Level",
    "Recommendations",
  ];

  sheet.autoFilter = "A7:U7";
  sheet.insertRow(7, headers);
  sheet.getColumn("A").alignment = { horizontal: "center", vertical: "top" };
  sheet.getRow(7).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn(1).font = { name: "Calibri", size: 10, bold: true };
  sheet.getColumn("B").width = 50;
  sheet.getColumn("C").width = 20;
  sheet.getColumn("D").width = 20;
  sheet.getColumn("E").width = 17;
  sheet.getColumn("F").width = 20;
  sheet.getColumn("G").width = 17;
  sheet.getColumn("H").width = 35;
  sheet.getColumn("I").width = 35;
  sheet.getColumn("J").width = 25;
  sheet.getColumn("K").width = 17;
  sheet.getColumn("L").width = 35;
  sheet.getColumn("M").width = 17;
  sheet.getColumn("N").width = 30;
  sheet.getColumn("O").width = 17;
  sheet.getColumn("P").width = 17;
  sheet.getColumn("Q").width = 17;
  sheet.getColumn("R").width = 17;
  sheet.getColumn("S").width = 30;
  sheet.getColumn("T").width = 17;
  sheet.getColumn("U").width = 35;

  sheet.getRow(2).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.getRow(3).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.getRow(4).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.getRow(5).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.getRow(6).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  sheet.getRow(7).font = { name: "Arial", size: 12, bold: true };
  sheet.getRow(7).height = 80;

  const dateCell = sheet.getCell("D2");
  dateCell.value = new Date();
  dateCell.style = { numFmt: "DD-MMM-YYYY", alignment: { horizontal: "left", vertical: "top" } };
  sheet.getCell("A2").value = "Date Exported:";
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A3").value = "Exported By:";
  sheet.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A4").value = "DoD Component:";
  sheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A5").value = "System / Project Name:";
  sheet.getCell("A5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A6").value = "DoD IT Registration No:";
  sheet.getCell("A6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };

  sheet.getCell("I2").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("I2").value = "System Type:";
  sheet.getCell("I2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("I4").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("I4").value = "POC Name:";
  sheet.getCell("I4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("I5").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("I5").value = "POC Phone:";
  sheet.getCell("I5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("I6").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("I6").value = "POC Email:";
  sheet.getCell("I6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };

  sheet.getCell("L2").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("L2").value = "OMB Project ID:";
  sheet.getCell("L2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("L5").font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell("L5").value = "Security Costs:";
  sheet.getCell("L4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("L5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("L6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };

  sheet.getCell("P2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  if (userId) {
    const user = await User.findByPk(userId);
    sheet.getCell("D3").value = `${user?.firstName} ${user?.lastName}`;
    sheet.getCell("K4").value = `${user?.firstName} ${user?.lastName}`;
    sheet.getCell("K6").value = `${user?.email}`;
  }

  const poamArray: string[][] = [];

  enum Columns {
    poamItemId,
    controlVulnDesc,
    securityControlNumber,
    officeOrg,
    securityChecks,
    resoucesRequired,
    scheduledCompDate,
    milestoneWithCompDate,
    milestoneChanges,
    sourceIdentifyingVuln,
    status,
    comments,
    rawSeverity,
    mitigations,
    severity,
    relevanceOfThreat,
    likelihood,
    impact,
    impactDesc,
    residualRiskLevel,
    recommendations,
  }

  const results = await getEvaluationSummary(boundaryId, undefined, true);
  const vulnResults = await getVulnSummary(boundaryId, undefined, true);

  interface BoundaryWithClassification extends Boundary {
    Classification?: Classification;
  }

  const boundary = (await Boundary.findOne({
    where: { id: boundaryId },
    include: { model: Classification },
  })) as BoundaryWithClassification;

  //export color in per classification, header, and fotter
  let classificationString = `${boundary?.Classification?.dataValues.name}`;

  if (boundary?.caveats) {
    classificationString += `// ${boundary?.caveats}`;
  }

  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;
  sheet.getCell("A1").value = classificationString;

  const bannerColor = boundary?.Classification?.dataValues.color;

  sheet.getCell("A1").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: bannerColor } };

  const cciItems = await CciItem.findAll({
    attributes: ["cciId"],
    include: [
      {
        model: CciReference,
        attributes: ["index"],
        through: { attributes: [] },
        where: {
          PolicyDocumentId: boundary?.PolicyDocumentId,
        },
      },
    ],
  });

  function assessmentToPoamStatus(assessmentStatus: string): string {
    if (assessmentStatus === "Open") return "In-Progress";
    if (assessmentStatus === "NotAFinding") return "Closed";
    if (assessmentStatus === "Not_Applicable") return "Not Applicable";
    if (assessmentStatus === "Not_Reviewed") return "Open";
    return "Unknown";
  }
  function nessusToPoamStatus(nessusStatus: string): string {
    if (nessusStatus === "Open") return "In-Progress";
    if (nessusStatus === "NotAFinding") return "Closed";
    if (nessusStatus === "Not_Applicable") return "Not Applicable";
    if (nessusStatus === "Not_Reviewed") return "Open";
    if (nessusStatus === null) return "In-Progress";
    return "Unknown";
  }

  for (const stig of results) {
    for (const stigData of stig.StigData) {
      const newRow: string[] = new Array(21).fill("");

      newRow[Columns.poamItemId] = (poamArray.length + 1).toString();

      newRow[Columns.controlVulnDesc] =
        `Title:\n${stigData.rule_title}\n\nDescription:\n${stigData.vuln_discuss}\n\n`;
      newRow[Columns.securityChecks] = stigData.vuln_num;
      newRow[Columns.status] = assessmentToPoamStatus(stigData.status);
      newRow[Columns.sourceIdentifyingVuln] = stig.title;
      newRow[Columns.rawSeverity] = catFromSeverity(stigData.severity)
        .toLowerCase()
        .substring("cat ".length);
      if (stigData.StigIdents.length > 0) {
        const control = getIndexesByCciIds(
          stigData.StigIdents.map((item) => item.text),
          cciItems,
        ).join("\n");
        if (control === "") {
          newRow[Columns.securityControlNumber] = "CM-6";
          logger.info({
            service: "Boundary",
            message: `Control not found, default Control CM-6 added for POAM Item ID: ${
              newRow[Columns.poamItemId]
            } `,
          });
        } else {
          newRow[Columns.securityControlNumber] = control;
        }
      } else {
        newRow[Columns.securityControlNumber] = "CM-6";
        logger.info({
          service: "Boundary",
          message: `CCI not found, default Control CM-6 added for POAM Item ID: ${
            newRow[Columns.poamItemId]
          } `,
        });
      }

      for (const evaluationItem of stigData.EvaluationItems) {
        newRow[Columns.officeOrg] = evaluationItem.Office_Org;
        newRow[Columns.resoucesRequired] = evaluationItem.Resources_Required;
        newRow[Columns.scheduledCompDate] = evaluationItem.Scheduled_Completion_Date;
        newRow[Columns.milestoneChanges] = evaluationItem.Milestone_Changes;
        newRow[Columns.mitigations] = evaluationItem.Mitigations;
        newRow[Columns.severity] = evaluationItem.Severity;
        newRow[Columns.relevanceOfThreat] = evaluationItem.Relevance_of_Threat;
        newRow[Columns.likelihood] = evaluationItem.Likelihood;
        newRow[Columns.impact] = evaluationItem.Impact;
        newRow[Columns.residualRiskLevel] = evaluationItem.Residual_Risk_Level;
        newRow[Columns.impactDesc] = evaluationItem.Impact_Description;
        newRow[Columns.recommendations] = evaluationItem.Recommendations;
        newRow[Columns.comments] = evaluationItem.Poam_Comments;

        for (const milestone of evaluationItem.Milestones) {
          newRow[Columns.milestoneWithCompDate] +=
            `Milestone: ${milestone.item}\nCompletion Date: ${milestone.completion_date}\n\n`;
        }

        newRow[Columns.controlVulnDesc] += `Affected:\n`;
        for (const assessmentItem of stigData.AssessmentItems) {
          newRow[Columns.controlVulnDesc] += `${assessmentItem.Assessment.System.name}\n`;
        }
      }

      poamArray.push(newRow);
    }
  }
  for (const result of vulnResults) {
    const newRow: string[] = new Array(21).fill("");
    newRow[Columns.poamItemId] = (poamArray.length + 1).toString();
    newRow[Columns.controlVulnDesc] = `Description:\n${result.description}\n\n`;
    newRow[Columns.securityControlNumber] = "RA-05";
    newRow[Columns.securityChecks] = `Plugin ID: ${result.pluginId.toString()}`;
    newRow[Columns.sourceIdentifyingVuln] = result.pluginName;

    for (const nessusBoundary of result.NessusPlugin_Boundaries) {
      newRow[Columns.officeOrg] = nessusBoundary.EvaluationItem.Office_Org;
      newRow[Columns.resoucesRequired] = nessusBoundary.EvaluationItem.Resources_Required;
      newRow[Columns.scheduledCompDate] = nessusBoundary.EvaluationItem.Scheduled_Completion_Date;
      newRow[Columns.milestoneChanges] = nessusBoundary.EvaluationItem.Milestone_Changes;
      newRow[Columns.mitigations] = nessusBoundary.EvaluationItem.Mitigations;
      newRow[Columns.severity] = nessusBoundary.EvaluationItem.Severity;
      newRow[Columns.relevanceOfThreat] = nessusBoundary.EvaluationItem.Relevance_of_Threat;
      newRow[Columns.likelihood] = nessusBoundary.EvaluationItem.Likelihood;
      newRow[Columns.impact] = nessusBoundary.EvaluationItem.Impact;
      newRow[Columns.residualRiskLevel] = nessusBoundary.EvaluationItem.Residual_Risk_Level;
      newRow[Columns.impactDesc] = nessusBoundary.EvaluationItem.Impact_Description;
      newRow[Columns.recommendations] = nessusBoundary.EvaluationItem.Recommendations;
      newRow[Columns.comments] = nessusBoundary.EvaluationItem.Poam_Comments;

      for (const milestone of nessusBoundary.EvaluationItem.Milestones) {
        newRow[Columns.milestoneWithCompDate] +=
          `Milestone: ${milestone.item}\nCompletion Date: ${milestone.completion_date}\n\n`;
      }
    }
    newRow[Columns.controlVulnDesc] += `Affected:\n`;

    for (const reportItem of result.NessusReportItems) {
      newRow[Columns.status] += `${reportItem.NessusReport?.System.name}\n ${nessusToPoamStatus(
        reportItem.statusOverride,
      )}\n`;
      newRow[Columns.rawSeverity] +=
        `${reportItem.NessusReport?.System.name}:\n ${result.riskFactor}\n`;
      newRow[Columns.controlVulnDesc] += `${reportItem.NessusReport?.System.name}\n`;
    }
    poamArray.push(newRow);
  }

  sheet.insertRows(8, poamArray, "o");

  return workbook;
}
