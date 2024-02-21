import ExcelJS from "exceljs";
import { getFindingsSheet, FindingSheetOptions, catFromSeverity } from "../findings";

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
      width: 10,
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

  for (const row of findingsSheet.Findings) {
    const newIndex = poamArray.length + 1;

    const newRow = [
      newIndex.toString(),
      row.securityKey,
      row.systemsAffected.join("\n"),
      row.control.join("\n"),
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

  sheet.insertRows(2, poamArray, "o");

  return workbook;
}
