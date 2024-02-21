import ExcelJS from "exceljs";
import { Boundary, CciItem, CciReference, User } from "../../../db/models";
import { getIndexesByCciIds } from "../cci";

export async function generatePoam(
  boundaryId: number,
  userId: number | undefined,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 80 }];
  // const baseFont = {name: 'Calibri', size: 10};
  // sheet.columns.forEach(column => {
  //     column.style = {
  //         font: baseFont,
  //         alignment: { horizontal: 'center', vertical: 'top', wrapText: true}
  //     }
  // });

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
    "Security Control Number (NC/NA controls only)",
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
    "Mitigations (in-house and in conjunction with the Navy CSSP)",
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
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "007A3D" } };

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

  // sheet.getColumn("J").font = { name: "Calibri", size: 10, bold: true };
  // sheet.getColumn("M").font = { name: "Calibri", size: 10, bold: true };
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

  const poamItemId = 0;
  const controlVulnDesc = 1;
  const securityControlNumber = 2;
  const officeOrg = 3;
  const securityChecks = 4;
  const resoucesRequired = 5;
  const scheduledCompDate = 6;
  const milestoneWithCompDate = 7;
  const milestoneChanges = 8;
  const sourceIdentifyingVuln = 9;
  const status = 10;
  const comments = 11;
  const rawSeverity = 12;
  const mitigations = 13;
  const severity = 14;
  const relevanceOfThreat = 15;
  const likelihood = 16;
  const impact = 17;
  const impactDesc = 18;
  const residualRiskLevel = 19;
  const recommendations = 20;

  const results = await getEvaluationSummary(boundaryId, undefined, true);
  const boundary = await Boundary.findByPk(boundaryId);

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

  for (const stig of results) {
    for (const stigData of stig.StigData) {
      const newRow: string[] = new Array(21).fill("");

      newRow[poamItemId] = (poamArray.length + 1).toString();

      newRow[controlVulnDesc] =
        `Title:\n${stigData.rule_title}\n\nDescription:\n${stigData.vuln_discuss}\n\n`;
      newRow[securityChecks] = stigData.vuln_num;
      newRow[status] = stigData.status;
      newRow[sourceIdentifyingVuln] = stig.title;
      newRow[rawSeverity] = stigData.severity;
      newRow[securityControlNumber] = getIndexesByCciIds(
        stigData.StigIdents.map((item) => item.text),
        cciItems,
      ).join("\n");

      for (const evaluationItem of stigData.EvaluationItems) {
        newRow[officeOrg] = evaluationItem.Office_Org;
        newRow[resoucesRequired] = evaluationItem.Resources_Required;
        newRow[scheduledCompDate] = evaluationItem.Scheduled_Completion_Date;
        newRow[milestoneChanges] = evaluationItem.Milestone_Changes;
        newRow[mitigations] = evaluationItem.Mitigations;
        newRow[severity] = evaluationItem.Severity;
        newRow[relevanceOfThreat] = evaluationItem.Relevance_of_Threat;
        newRow[likelihood] = evaluationItem.Likelihood;
        newRow[impact] = evaluationItem.Impact;
        newRow[residualRiskLevel] = evaluationItem.Residual_Risk_Level;
        newRow[impactDesc] = evaluationItem.Impact_Description;
        newRow[recommendations] = evaluationItem.Recommendations;
        newRow[comments] = evaluationItem.Poam_Comments;

        for (const milestone of evaluationItem.Milestones) {
          newRow[milestoneWithCompDate] +=
            `Milestone: ${milestone.item}\nCompletion Date: ${milestone.completion_date}\n\n`;
        }

        newRow[controlVulnDesc] += `Affected:\n`;
        for (const assessmentItem of stigData.AssessmentItems) {
          newRow[controlVulnDesc] += `${assessmentItem.Assessment.System.name}\n`;
        }
      }

      poamArray.push(newRow);
    }
  }

  sheet.insertRows(8, poamArray, "o");

  return workbook;
}
