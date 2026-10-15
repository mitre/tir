import { Protocol, System } from "../../../db/models";
import { limitExcelCell } from "./excel";
import { NessusOverride } from "~/db/models/nessusOverride";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { NessusCsvHeaders, HeaderLabel } from "~/types/nessus";

type SourceData = { report: NessusReport; item: NessusReportItem };

let protocolMap: Map<number, string> | null = null;

async function preloadProtocolMap(): Promise<void> {
  if (protocolMap) return;
  const protocols = await Protocol.findAll({ attributes: ["id", "name"] });
  protocolMap = new Map(protocols.map((p) => [p.id, p.name]));
}

function protocolFromId(id?: number | null): string {
  if (!protocolMap || !id) return "";
  return protocolMap.get(id) ?? "";
}

function isSkippedStatus(value?: string | null): boolean {
  const normalizedValue = value?.toLowerCase();

  return (
    normalizedValue === "notafinding" ||
    normalizedValue === "notapplicable" ||
    normalizedValue === "not_a_finding" ||
    normalizedValue === "not_applicable"
  );
}

export type NessusSoftwareItem = {
  name: string;
  version: string;
  pluginId: number;
  systems: string[];
};

export type NessusParentObject = {
  isComponent: boolean;
  existingObjects: string[];
};

type NessusSoftwareRow = [
  name: string,
  version: string,
  systems: string,
  pluginId: string,
  component: string,
];

const columnGetters: Record<HeaderLabel, (ct: SourceData) => string> = {
  [NessusCsvHeaders.PluginId]: ({ item }) => String(item.NessusPlugin?.pluginId ?? ""),
  [NessusCsvHeaders.CVE]: (_ct) => "",
  [NessusCsvHeaders.CvssV2]: ({ item }) => String(item.cvssTemporalScore ?? ""),
  [NessusCsvHeaders.CvssV3]: ({ item }) => String(item.cvss3TemporalScore ?? ""),
  [NessusCsvHeaders.Risk]: ({ item }) => String(item.NessusPlugin?.riskFactor ?? ""),
  [NessusCsvHeaders.Host]: ({ report }) =>
    String((report as any).host ?? report.reportHostName ?? ""),
  [NessusCsvHeaders.Protocol]: ({ item }) => String(protocolFromId(item.ProtocolId)),
  [NessusCsvHeaders.Port]: ({ item }) => String(item.port ?? ""),
  [NessusCsvHeaders.Name]: ({ item }) => String(item.NessusPlugin?.pluginName ?? ""),
  [NessusCsvHeaders.Synopsis]: ({ item }) => String(item.NessusPlugin?.synopsis ?? ""),
  [NessusCsvHeaders.Description]: ({ item }) =>
    String(toCsvCell(item.NessusPlugin?.description) ?? ""),
  [NessusCsvHeaders.Solution]: ({ item }) => String(item.NessusPlugin?.solution ?? ""),
  [NessusCsvHeaders.SeeAlso]: ({ item }) => String((item.NessusPlugin as any)?.seeAlso ?? ""),
  [NessusCsvHeaders.PluginOutput]: ({ item }) =>
    String(toCsvCell(limitExcelCell(item.pluginOutput)) ?? ""),
};

function getCveList(item: NessusReportItem): string[] {
  const arr = item.NessusPlugin?.Cves?.map((c) => String(c.cveId)) ?? [];
  return arr.length ? arr : [""];
}

function toCsvCell(raw: string | undefined): string {
  if (!raw) {
    return "";
  }
  let str = raw;
  str = str.replace(/"/g, '""');
  if (/[",\n]/.test(str)) {
    str = `"${str}"`;
  }
  return str;
}

export async function generateNessusCsv(
  reports: NessusReport[],
  overrides: { [id: number]: NessusOverride[][] },
  headers: readonly HeaderLabel[],
  factorOverrides: boolean = true,
): Promise<string> {
  await preloadProtocolMap();

  let csv = headers + "\r\n";

  let cveCol = -1;
  const nonCveHeaders: HeaderLabel[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === NessusCsvHeaders.CVE) cveCol = i;
    else nonCveHeaders.push(headers[i]);
  }

  const gettersForRun = nonCveHeaders.map((h) => columnGetters[h]);

  for (let r = 0; r < reports.length; r++) {
    const report = reports[r];
    const items = report?.NessusReportItems ?? [];

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const ct: SourceData = { report, item };

      const baseCells = new Array<string>(nonCveHeaders.length);
      for (let i = 0; i < gettersForRun.length; i++) {
        baseCells[i] = gettersForRun[i](ct);
      }

      const severityColIndex = nonCveHeaders.indexOf(NessusCsvHeaders.Risk);

      const cves = getCveList(item);
      for (let k = 0; k < cves.length; k++) {
        const row = new Array<string>(headers.length);
        let nonIdx = 0;

        if (factorOverrides && item.severityOverride) {
          const overriddenSeverity = severityFromOverride(item.severityOverride);
          if (severityColIndex >= 0) {
            baseCells[severityColIndex] = overriddenSeverity;
          }
        }

        for (let col = 0; col < headers.length; col++) {
          if (col === cveCol) {
            row[col] = cves[k];
          } else {
            row[col] = baseCells[nonIdx++];
          }
        }

        let skipped = false;

        if (factorOverrides && overrides[report.SystemId]) {
          for (const override of overrides[report.SystemId]) {
            if (Array.isArray(override)) {
              for (const sysOverride of override) {
                if (
                  sysOverride.NessusPluginId === item.NessusPluginId &&
                  sysOverride.type.toLowerCase() === "status" &&
                  isSkippedStatus(sysOverride.value)
                ) {
                  skipped = true;
                }
              }
            }
          }
        }

        if (factorOverrides && isSkippedStatus(item.statusOverride)) {
          skipped = true;
        }

        if (!skipped) {
          csv += row.join(",") + "\r\n";
        }
      }
    }
  }

  return csv;
}

function getNames(longName: string): string[] {
  const names: string[] = [];
  const splitName = longName.split("-");
  for (let i = splitName.length - 1; i >= 0; i--) {
    let myName = "";
    for (let j = 0; j <= i; j++) {
      myName += splitName[j].replaceAll('"', "");
      if (j < i) {
        myName += "-";
      }
    }
    names.push(myName);
  }
  return names;
}

function addSoftwareSystem(
  name: string,
  version: string,
  pluginId: number,
  currentItems: NessusSoftwareItem[],
  system: string,
): [string[], boolean] {
  const myItem = currentItems.find(
    (nsi) =>
      `${nsi.name}-${nsi.version}-${nsi.pluginId.toString()}` ===
      `${name}-${version}-${pluginId.toString()}`,
  );
  if (myItem) {
    const mySystems = myItem.systems;
    if (!mySystems.includes(system)) {
      mySystems.push(system);
    }
    return [mySystems, true];
  } else {
    return [[system], false];
  }
}

export function getParent(
  printName: string,
  printVersion: string,
  parentItem: string[],
): NessusParentObject {
  const newItem = printName.replaceAll('"', "") + "-" + printVersion.replaceAll('"', "");
  if (parentItem === undefined) {
    const blankNpo: NessusParentObject = {
      isComponent: false,
      existingObjects: [newItem],
    };
    return blankNpo;
  }

  const availableNames = getNames(printName);
  let foundItem: boolean = false;
  for (const testName of availableNames) {
    const testVal = testName + "-" + printVersion.replaceAll('"', "");
    const foundParent = parentItem.find((pi) => pi === testVal);
    if (foundParent) {
      foundItem = true;
      break;
    }
  }

  if (!foundItem) {
    parentItem.push(newItem);
  }

  const npo: NessusParentObject = {
    isComponent: foundItem,
    existingObjects: parentItem,
  };
  return npo;
}

function formatOutput(
  longString: string,
  system: string,
  pluginId: number,
  currentItems: NessusSoftwareItem[],
): NessusSoftwareItem[] {
  const indices: number[] = [];
  const softwareItems = currentItems;
  if (pluginId === 178102) {
    let index = longString.indexOf("\n - ");
    while (index !== -1) {
      indices.push(index);
      index = longString.indexOf("\n - ", index + 1);
    }
    if (indices.length > 1) {
      const splitDelimiter = /\n - /;
      const splitted = longString.split(splitDelimiter);
      for (const myVal of splitted) {
        const softwareDetails = myVal.split("\n");
        const mySoftware = softwareDetails[0];
        if (mySoftware !== "") {
          const myVersion = myVal
            .split("All Possible Versions")[1]
            .split("\n")[0]
            .split(":")[1]
            .trim()
          const printName = '"' + mySoftware + '"';
          const printVersion = '"' + myVersion + '"';
          const theseSystems = addSoftwareSystem(
            printName,
            printVersion,
            pluginId,
            currentItems,
            system,
          );
          if (!theseSystems[1]) {
            const currentSWI: NessusSoftwareItem = {
              name: printName,
              version: printVersion,
              systems: theseSystems[0],
              pluginId,
            };
            softwareItems.push(currentSWI);
          }
        }
      }
    }
  } else if (pluginId === 22869) {
    const splitDelimiter = /\n/;
    const splitted = longString.split(splitDelimiter);
    for (const myVal of splitted) {
      // Linux Plugin Used
      const softwareDetails = myVal.split("|");
      if (softwareDetails.length > 1) {
        let mySoftware = myVal.trim().split(/\s+/)[0];
        const myVersion = mySoftware
          .replace(/-(\d+.*)$/, "###$1")
          .split("###")[1]
          .trim();
        mySoftware = mySoftware.replace(myVersion, "").trim().replace(/-$/, "");
        const printName = '"' + mySoftware + '"';
        const printVersion = '"' + myVersion + '"';
        const theseSystems = addSoftwareSystem(
          printName,
          printVersion,
          pluginId,
          currentItems,
          system,
        );
        if (!theseSystems[1]) {
          const currentSWI: NessusSoftwareItem = {
            name: printName,
            version: printVersion,
            systems: theseSystems[0],
            pluginId,
          };
          softwareItems.push(currentSWI);
        }
      } else if (myVal !== "") {
        logger.info({
          service: "Nessus Export: 22869 non compliant output",
          message: `Non empty non compliant output found for plugin 22869: ${myVal}`,
        });
      }
    }
  }

  softwareItems.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
  return softwareItems;
}

function getSystemsPrint(systems: string[]): string {
  let returnString = '"';
  let sysCt = 0;
  for (const myStr of systems) {
    returnString += myStr;
    sysCt++;
    if (sysCt < systems.length) {
      returnString += ", ";
    }
  }
  returnString += '"';
  return returnString;
}

export async function generateNessusSW(
  boundaryId: number,
  reports: NessusReport[],
): Promise<NessusSoftwareRow[]> {
  const csvContent: NessusSoftwareRow[] = [
    ["Name", "Version", "Systems", "Plugin ID", "Component"],
  ];

  const loadedSystems = await System.findAll({
    where: {
      BoundaryId: boundaryId,
    },
  });

  let ReportedSoftware: NessusSoftwareItem[] = [];

  for (const report of reports) {
    if (!report.NessusReportItems) continue;

    for (const row of report.NessusReportItems) {
      if (!row.NessusPlugin || !row.pluginOutput) {
        continue;
      }

      const pluginId = row.NessusPlugin.pluginId;
      // Other potential pluginIds to be consider commented here: 20811, 22869, 97993, 178102
      if (pluginId !== 22869 && pluginId !== 178102) {
        continue;
      }

      const system = loadedSystems.find((sys) => sys.id === report.SystemId);

      if (!system?.name) {
        continue;
      }

      ReportedSoftware = formatOutput(
        row.pluginOutput,
        system.name,
        pluginId,
        ReportedSoftware,
      );
    }
  }

  let parentItem: string[] = [];

  for (const sw of ReportedSoftware) {
    const parentTestComponent = getParent(sw.name, sw.version, parentItem);
    parentItem = parentTestComponent.existingObjects;

    csvContent.push([
      sw.name,
      sw.version,
      getSystemsPrint(sw.systems),
      sw.pluginId.toString(),
      parentTestComponent.isComponent.toString(),
    ]);
  }

  // Finished SW Export
  return csvContent;
}
