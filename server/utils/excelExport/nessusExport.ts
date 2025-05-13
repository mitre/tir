import ExcelJS from "exceljs";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, Classification, Protocol, System } from "../../../db/models";
import { INTEGER } from "sequelize";
import { RowList } from "postgres";
import { text } from "stream/consumers";
import { SubstringFilter } from "ldapjs";

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

export type NessusSoftwareItem = {
  name: string;
  version: string;
  pluginId: number;
  systems: string[];
};

export type NessusParentObject = {
  isComponent: boolean;
  existingObjects: string[];
}

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

function getNames(longName: string): string[] {
  const names: string[] = [];
  var splitName = longName.split("-")
  for (let i = splitName.length - 1; i >= 0; i--) {
    var myName = ""
    for (let j = 0; j <= i; j++) {
      myName += splitName[j].replaceAll('"', "");
      if (j < i) {
        myName += "-"
      }
    }
    names.push(myName)
  }
  return names;
}

function addSoftwareSystem(name: string, version: string, pluginId: number, currentItems: NessusSoftwareItem[], system: string): [string[], boolean] {
  const myItem = currentItems.find(
    (nsi) => `${nsi.name}-${nsi.version}-${nsi.pluginId.toString()}` === `${name}-${version}-${pluginId.toString()}`
  )
  if (myItem) {
    var mySystems = myItem.systems
    if (!mySystems.includes(system)) {
      mySystems.push(system)
    }
    return [mySystems, true]
  } else {
    return [[system], false]
  }
}

export function getParent(printName: string, printVersion: string, parentItem: string[]): NessusParentObject {
  var newItem = printName.replaceAll('"',"")+'-'+printVersion.replaceAll('"', "")
  if (parentItem == undefined) {
    const blank_npo: NessusParentObject = {
      isComponent: false,
      existingObjects: [newItem],
    }
    return blank_npo
  }

  var availableNames = getNames(printName)
  var foundItem: boolean = false
  for (const testName of availableNames) {
    var testVal = testName+'-'+printVersion.replaceAll('"', "")
    const foundParent = parentItem.find((pi) => pi === testVal)
    if (foundParent) {
      foundItem = true
      break;
    }
  }  
  
  if (!foundItem) {
    parentItem.push(newItem)
  }
  
  const npo: NessusParentObject = {
    isComponent: foundItem,
    existingObjects: parentItem,
  }
  return npo
}

function formatOutput(longString: string, system: string, pluginId: number, currentItems: NessusSoftwareItem[]): NessusSoftwareItem[] {
  const indices: number[] = [];
  var softwareItems = currentItems;
  if (pluginId == 178102) {
    let index = longString.indexOf("\n - ");
    while (index !== -1) {
      indices.push(index);
      index = longString.indexOf("\n - ", index + 1);
    }
    if (indices.length > 1) {
      console.log(indices.length)
      var splitDelimiter = /\n - /
      const splitted = longString.split(splitDelimiter)
      // var allObjects = ""
      for (const myVal of splitted) {
        // allObjects += myVal.substring(0, myVal.indexOf("\n")) + "\n";
        var softwareDetails = myVal.split("\n")
        var mySoftware = softwareDetails[0].replace('"', "\"")
        if (mySoftware != "") {
          var myVersion = myVal.split("All Possible Versions")[1].split("\n")[0].split(":")[1].trim().replace('"', "\"")
          var printName = '"' + mySoftware + '"'
          var printVersion = '"' + myVersion + '"'
          var theseSystems = addSoftwareSystem(printName, printVersion, pluginId, currentItems, system)
          if (!theseSystems[1]) {
            const currentSWI: NessusSoftwareItem = {
              name: printName,
              version: printVersion,
              systems: theseSystems[0],
              pluginId: pluginId,
            }
            softwareItems.push(currentSWI)
          }
        }
      }
    }
  } else if (pluginId == 22869) {
    var splitDelimiter = /\n/
    const splitted = longString.split(splitDelimiter)
    for (const myVal of splitted) {
      console.log("Linux Plugin Used")
      var softwareDetails = myVal.split("|")
      if (softwareDetails.length > 1) {
        var mySoftware = myVal.trim().split(/\s+/)[0]
        var myVersion = mySoftware.replace(/-(\d+.*)$/, "###$1").split("###")[1].trim()
        mySoftware = mySoftware.replace(myVersion, "").trim().replace(/-$/,"")
        var printName = '"' + mySoftware + '"'
        var printVersion = '"' + myVersion + '"'
        var theseSystems = addSoftwareSystem(printName, printVersion, pluginId, currentItems, system)
        if (!theseSystems[1]) {
          const currentSWI: NessusSoftwareItem = {
            name: printName,
            version: printVersion,
            systems: theseSystems[0],
            pluginId: pluginId,
          }
          softwareItems.push(currentSWI)
        }
      } else if (myVal != "") {
        console.log("non empty non compliant")
      }
    }
  }

  softwareItems.sort((a,b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
  return softwareItems
}

function getSystemsPrint(systems: string[]): string {
  var returnString = '"'
  var sysCt = 0
  for (const myStr of systems) {
    returnString += myStr
    sysCt++
    if (sysCt < systems.length) {
      returnString += ", "
    }
  }
  returnString += '"'
  return returnString;
}

export async function generateNessusSW(
  boundaryId: number,
  reports: NessusReport[],
): Promise<any[][]> {

  const headers: string[] = [
    "Name",
    "Version",
    "Systems",
    "Plugin ID",
    "Component",
  ];

  let csvContent: string[][] = []
  csvContent.push(Array(4).fill("")); // for headers

  let csvRow = 0
  let csvColumn = 0
  for (const h of headers) {
    csvContent[csvRow][csvColumn] = h;
    csvColumn++;
  }
  csvRow++;

  const loadedSystems = await System.findAll({
    where: {
      BoundaryId: boundaryId
    }
  })

  var ReportedSoftware: NessusSoftwareItem[] = []

  for (const report of reports) {
    for (const row of report.NessusReportItems) {
      // if (row.NessusPlugin.pluginId == 20811 || row.NessusPlugin.pluginId == 22869 || 
      //   row.NessusPlugin.pluginId == 97993 || row.NessusPlugin.pluginId == 178102) {
      if (row.NessusPlugin.pluginId == 22869 || 
        row.NessusPlugin.pluginId == 178102) {
        const mySystem = loadedSystems.find((sys) => sys.id === report.SystemId)
        if (mySystem) {
          ReportedSoftware = formatOutput(row.pluginOutput, mySystem.name, row.NessusPlugin.pluginId, ReportedSoftware)
        }
      }
    }
  }

  var parentItem: string[] = []
  for (const sw of ReportedSoftware) {
    
    // this is where we check for parent
    var parentTestComponent = getParent(sw.name, sw.version, parentItem)
    parentItem = parentTestComponent.existingObjects

    csvContent.push(Array(4).fill("")); // for headers
    csvContent[csvRow][0] = sw.name
    csvContent[csvRow][1] = sw.version
    csvContent[csvRow][2] = getSystemsPrint(sw.systems)
    csvContent[csvRow][3] = sw.pluginId
    csvContent[csvRow][4] = parentTestComponent.isComponent
    csvRow++
  }

  interface BoundaryWithClassification extends Boundary {
    Classification?: Classification;
  }

  console.log("Finished SW Export")
  return csvContent;
}
