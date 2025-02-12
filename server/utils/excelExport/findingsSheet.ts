import ExcelJS from "exceljs";
import { getFindingsSheet, FindingSheetOptions, catFromSeverity } from "../findings";
import { getVulnSummary, severityFromOverride } from "../vulnerabilities";
import { Boundary, Classification } from "../../../db/models";

export async function generateFindings(
  boundaryId: number,
  filterStatus: string[],
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 100 }];

  sheet.columns = [
    {
      width: 12,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "center", vertical: "top", wrapText: true },
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
      width: 25,
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
      width: 17,
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
      width: 28,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 14,
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
      width: 51,
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
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 52,
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
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  const headers: string[] = [
    "Item Number",
    "Vulnerability/Finding/V-Key/CVE",
    "System Affected",
    "Control",
    "CCI",
    "Source",
    "STIG ID",
    "Category",
    "Severity",
    "Vuln Description",
    "Status",
    "Check",
    "Fix Action",
    "Findings Details",
    "Recommendation",
    "Mitigations",
    "Notes",
  ];
  enum Columns {
    itemId,
    securityKey,
    systemsAffected,
    control,
    cci,
    source,
    stigId,
    catFromSeverity,
    rawSeverity,
    vuln,
    status,
    check,
    fix,
    findingDetails,
    recommendations,
    mitigations,
    notes,
  }
  sheet.insertRow(1, headers);

  sheet.getRow(1).font = { name: "Times New Roman", size: 12, bold: true };
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(1).height = 40;
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
  sheet.getRow(1).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.autoFilter = "A1:Q1";

  const poamArray: string[][] = [];

  const findingSheetOptions: FindingSheetOptions = {
    Open: filterStatus.includes("Open"),
    NotAFinding: filterStatus.includes("NotAFinding"),
    Not_Reviewed: filterStatus.includes("Not_Reviewed"),
    Not_Applicable: filterStatus.includes("Not_Applicable"),
  };

  const findingsSheet = await getFindingsSheet(boundaryId, findingSheetOptions);
  const vulnResults = await getVulnSummary(boundaryId, findingSheetOptions, false);

  function nessusToFindingStatus(nessusStatus: string): string {
    if (nessusStatus === null) return "Open";
    return nessusStatus;
  }

  for (const row of findingsSheet.Findings) {
    const newIndex = poamArray.length + 1;

    const newRow = [
      newIndex.toString(),
      row.securityKey,
      row.systemsAffected.join("\n"),
      row.control,
      row.cci.join("\n"),
      row.source,
      row.stigId,
      catFromSeverity(row.rawSeverity),
      row.rawSeverity,
      row.vuln,
      row.status,
      row.check,
      row.fix,
      row.findingDetails.join("\n"),
      row.recommendations,
      row.mitigations,
      row.notes,
    ];
    poamArray.push(newRow);
  }

  if (vulnResults) {
    for (const result of vulnResults) {
      const newRow: string[] = new Array(21).fill("");
      newRow[Columns.itemId] = (poamArray.length + 1).toString();
      newRow[Columns.securityKey] = `Plugin ID: ${result.pluginId.toString()}`;
      newRow[Columns.control] = "RA-05";
      newRow[Columns.source] = result.pluginName;

      newRow[Columns.vuln] = `${result.description}\n`;
      newRow[Columns.check] = `${result.synopsis}\n`;
      newRow[Columns.fix] = `${result.solution}\n`;

      for (const nessusBoundary of result.NessusPlugin_Boundaries) {
        newRow[Columns.recommendations] = nessusBoundary.EvaluationItem.Recommendations;
        newRow[Columns.mitigations] = nessusBoundary.EvaluationItem.Mitigations;
        newRow[Columns.notes] = nessusBoundary.EvaluationItem.Poam_Comments;
      }

      for (const reportItem of result.NessusReportItems) {
        if (reportItem.severityOverride) {
          newRow[Columns.rawSeverity] += `${reportItem.NessusReport?.System
            .name}:\n${severityFromOverride(reportItem.severityOverride)}\n`;
        } else {
          newRow[Columns.rawSeverity] +=
            `${reportItem.NessusReport?.System.name}:\n${result.riskFactor}\n`;
        }

        newRow[Columns.status] += `${reportItem.NessusReport?.System
          .name}: \n${nessusToFindingStatus(reportItem.statusOverride)}\n`;
        newRow[Columns.systemsAffected] += `${reportItem.NessusReport?.System.name}\n`;
        newRow[Columns.findingDetails] +=
          `${reportItem.NessusReport?.System.name}:\nPlugin Output:\n ${reportItem.pluginOutput}\nCVE :\n`;

        for (const cve of result.Cves) {
          newRow[Columns.findingDetails] += ` ${cve.cveId}\n`;
        }
        newRow[Columns.findingDetails] += `\n`;
      }

      poamArray.push(newRow);
    }
  }

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

  sheet.insertRows(2, poamArray, "o");

  return workbook;
}
