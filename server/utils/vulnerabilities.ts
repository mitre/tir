import { Op } from "sequelize";
import {
  EvaluationItem,
  System,
  Milestone,
  Boundary,
  NessusPlugin_Boundary,
} from "../../db/models";

import { FindingSheetOptions } from "./findings";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Cve } from "~/db/models/cve";
import { NessusReport } from "~/db/models/nessusReport";

export async function getVulnSummary(
  boundaryId: number,
  options?: FindingSheetOptions,
  poam?: boolean,
) {
  let statusWhereClause = {};
  if (poam) {
    statusWhereClause = { statusOverride: { [Op.or]: [null, "Open", "Not_Reviewed"] } };
  }
  if (options) {
    const status = Object.keys(options).filter((key): key is keyof FindingSheetOptions => {
      return options[key as keyof FindingSheetOptions];
    });
    if (status.includes("Open")) {
      status.push(null);
    }
    statusWhereClause = { statusOverride: { [Op.or]: status } };
  }
  const vulnSummary = await NessusPlugin.findAll({
    attributes: [
      "id",
      "pluginId",
      "pluginName",
      "riskFactor",
      "description",
      "solution",
      "synopsis",
    ],
    include: [
      { model: Cve, attributes: ["id", "cveId"], required: true, through: { attributes: [] } },
      {
        model: NessusReportItem,
        attributes: [
          "id",
          "pluginOutput",
          "cvssTemporalScore",
          "cvss3TemporalScore",
          "statusOverride",
          "severityOverride",
        ],
        required: true,
        where: statusWhereClause,
        include: [
          {
            model: NessusReport,
            attributes: ["id"],
            required: true,
            include: [
              {
                model: System,
                attributes: ["id", "name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    where: { id: boundaryId },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: NessusPlugin_Boundary,
        where: { BoundaryId: boundaryId },
        include: [
          {
            model: EvaluationItem,
            include: [
              {
                model: Milestone,
              },
            ],
          },
        ],
      },
    ],
  });
  return vulnSummary;
}

export function severityFromOverride(overrideSeverity: number): string {
  type wordSeverity = "None" | "Low" | "Medium" | "High" | "Critical";
  type intSeverity = 0 | 1 | 2 | 3 | 4;
  const severityMap: Record<intSeverity, wordSeverity> = {
    4: "Critical",
    3: "High",
    2: "Medium",
    1: "Low",
    0: "None",
  };

  let Cat = "";
  if (overrideSeverity === 4) {
    Cat = severityMap[4];
  } else if (overrideSeverity === 3) {
    Cat = severityMap[3];
  } else if (overrideSeverity === 2) {
    Cat = severityMap[2];
  } else if (overrideSeverity === 1) {
    Cat = severityMap[1];
  } else if (overrideSeverity === 0) {
    Cat = severityMap[0];
  }

  return Cat;
}