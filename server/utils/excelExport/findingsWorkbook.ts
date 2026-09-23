import ExcelJS from "exceljs";

export enum FindingsColumns {
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

const headers = [
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

const defaultWidths = [12, 22, 25, 30, 17, 34, 28, 14, 16, 51, 16, 52, 52, 52, 30, 52, 52];

export function emptyFindingsRow(): string[] {
  return new Array<string>(headers.length).fill("");
}

export function createFindingsWorkbook(
  widthOverrides: Partial<Record<FindingsColumns, number>> = {},
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 100 }];

  sheet.columns = defaultWidths.map((width, index) => ({
    width: widthOverrides[index as FindingsColumns] ?? width,
    style: {
      font: { name: "Calibri", size: 10 },
      alignment: {
        horizontal: index === FindingsColumns.itemId ? "center" : "left",
        vertical: "top",
        wrapText: true,
      },
    },
  }));

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

  return { workbook, sheet };
}
