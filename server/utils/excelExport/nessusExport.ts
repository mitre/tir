import ExcelJS from "exceljs";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, Classification, Protocol, System } from "../../../db/models";
import { INTEGER } from "sequelize";
import { RowList } from "postgres";

var ProtocolLookupTable: { [id: number] : string } = {};
var sectionCurrent = -1
type wordSeverity = "None" | "Low" | "Medium" | "High" | "Critical";
type intSeverity = 0 | 1 | 2 | 3 | 4;
const severityMap: Record<intSeverity, wordSeverity> = {
  4: "Critical",
  3: "High",
  2: "Medium",
  1: "Low",
  0: "None",
};

function formatForCSV(raw: string): string {
  if (!raw) {
    return ""
  }
  let str = raw
  str = str.replace(/\\/g, '\\\\');
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

function getProtocolByID(protocols: Protocol[], id: number): string {
  if (ProtocolLookupTable.length != 0 && id in ProtocolLookupTable) {
    return ProtocolLookupTable[id].value
  } else {
    for (const protocol of protocols) {
      if (protocol.id == id) {
        ProtocolLookupTable[id] = { key: id, value: protocol.name };  
        return protocol.name
      }
    }
  }
  return ""
}

export async function generateNessusCsv(
  boundaryId: number,
  reports: NessusReport[],
): Promise<any[][]> {

  const headers: string[] = [
    "Plugin ID",
    "CVE",
    "CVSS v2.0",
    "Risk",
    "Host",
    "Protocol",
    "Port",
    "Name",
    "Synopsis",
    "Description",
    "Solution",
    "See Also",
    "Plugin Output",
  ];

  let csvContent: string[][] = []
  csvContent.push(Array(13).fill("")); // for headers
  for (const report of reports) {
    for (const row of report.NessusReportItems) {
      csvContent.push(Array(13).fill(""));
    }
  }

  let csvRow = 0
  let csvColumn = 0
  for (const h of headers) {
    csvContent[csvRow][csvColumn] = h;
    csvColumn++;
  }
  csvRow++;

  const Protocols = await Protocol.findAll({})
  for (const report of reports) {
    for (const row of report.NessusReportItems) {
      // csvContent[csvRow][0] = row.NessusPluginId.toString()
      csvContent[csvRow][0] = row.NessusPlugin.pluginId.toString()
      csvContent[csvRow][1] = ""
      csvContent[csvRow][2] = ""
      csvContent[csvRow][3] = formatForCSV(row.severityOverride || row.NessusPlugin.riskFactor)
      csvContent[csvRow][4] = formatForCSV(report.reportHostName)
      csvContent[csvRow][5] = getProtocolByID(Protocols, row.ProtocolId)
      csvContent[csvRow][6] = (row.port == 0 ? "" : row.port)
      csvContent[csvRow][7] = formatForCSV(row.NessusPlugin.pluginName)
      csvContent[csvRow][8] = formatForCSV(row.NessusPlugin.synopsis)
      csvContent[csvRow][9] = formatForCSV(row.NessusPlugin.description)
      csvContent[csvRow][10] = formatForCSV(row.NessusPlugin.solution)
      csvContent[csvRow][11] = ""
      csvContent[csvRow][12] = formatForCSV(row.pluginOutput)
      csvRow++
    }
  }

  interface BoundaryWithClassification extends Boundary {
    Classification?: Classification;
  }

  return csvContent;
}
