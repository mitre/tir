import { Op } from "sequelize";
import {
  Assessment,
  AssessmentItem,
  Stig,
  StigData,
  System,
  StigIdent,
  Boundary,
  CciItem,
  CciReference,
  Evaluation,
  EvaluationItem,
} from "../../db/models";
import { getIndexesByCciIds } from "./cci";

// import findingsDownloadPost from "../api/boundaries/findingsDownload.post";

export type FindingCounts = {
  Open: number;
  NotAFinding: number;
  Not_Applicable: number;
  Not_Reviewed: number;
  [key: string]: number;
};

export type FindingSheetOptions = {
  Open: boolean;
  NotAFinding: boolean;
  Not_Applicable: boolean;
  Not_Reviewed: boolean;
};

export type FindingsSheetItem = {
  securityKey: string; // assessmentItem.vuln_num *
  systemsAffected: string[]; // System.name
  control: string[]; // lookup
  cci: string[]; // StigIdents.text *
  source: string; // Assessment.Stig.title
  stigId: string; // StigData.rule_id*
  rawSeverity: string; // StigData.severity*
  vuln: string; // StigData.vuln_discuss*
  status: string; // assessmentItem.status
  check: string; // StigData.check_check_content*
  fix: string; // StigData.fixtext*
  findingDetails: string[]; // AssessmentItem.finding_details
  recommendations: string;
  mitigations: string;
  notes: string; // POAM Comments
};

export type FindingsSheet = {
  Findings: FindingsSheetItem[];
};

export async function getFindingsSheet(
  boundaryId: number,
  options?: FindingSheetOptions,
): Promise<FindingsSheet> {
  let whereClause = ["Open"];
  if (options) {
    whereClause = Object.keys(options).filter((key): key is keyof FindingSheetOptions => {
      return options[key as keyof FindingSheetOptions];
    });
  }

  const findings = await StigData.findAll({
    attributes: [
      "vuln_num",
      "rule_id",
      "severity",
      "check_check_content",
      "fixtext",
      "vuln_discuss",
    ],
    include: [
      {
        model: AssessmentItem,
        attributes: ["finding_details", "comments", "status"],
        required: true,
        where: {
          status: {
            [Op.or]: whereClause,
          },
        },
        include: [
          {
            model: Assessment,
            attributes: ["id"],
            where: {
              succeededByAssessmentId: { [Op.is]: null },
            },
            required: true,
            include: [
              {
                model: System,
                attributes: ["name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    required: true,
                    where: { id: boundaryId },
                  },
                ],
              },
              {
                model: Stig,
                attributes: ["title"],
                where: {},
              },
            ],
          },
        ],
      },
      {
        model: StigIdent,
        through: { attributes: [] },
        attributes: ["text"],
        where: {
          system: {
            [Op.like]: "%cci",
          },
        },
      },
      {
        model: EvaluationItem,
        attributes: ["Mitigations", "Recommendations", "Poam_Comments"],
        include: [
          {
            model: Evaluation,
            attributes: [],
            where: { BoundaryId: boundaryId },
            required: true,
          },
        ],
      },
    ],
  });

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

  const findingSheetItems: FindingsSheetItem[] = [];
  const findingsSheet = { Findings: findingSheetItems };

  if (findings) {
    for (const finding of findings) {
      const systemsList: string[] = [];
      const detailsList: string[] = [];
      const identList: string[] = [];

      const findingCounts = initializeCounts();

      if (finding.AssessmentItems) {
        for (const item of finding.AssessmentItems) {
          const systemName = item.Assessment?.System?.name;
          systemsList.push(`${systemName}`);
          detailsList.push(`${systemName}:\n${item.finding_details}`);
          findingCounts[item.status]++;
        }
      }

      if (finding.StigIdents) {
        for (const ident of finding.StigIdents) {
          identList.push(ident.text);
        }
      }

      let poamComments = "";
      let recommendations = "";
      let mitigations = "";

      if (finding.EvaluationItems) {
        for (const evalItem of finding.EvaluationItems) {
          poamComments = evalItem.Poam_Comments;
          recommendations = evalItem.Recommendations;
          mitigations = evalItem.Mitigations;
        }
      }

      const findingsSheetItem: FindingsSheetItem = {
        securityKey: finding.vuln_num,
        stigId: finding.rule_id,
        rawSeverity: finding.severity,
        vuln: finding.vuln_discuss,
        check: finding.check_check_content,
        fix: finding.fixtext,
        source: finding.AssessmentItems![0].Assessment!.Stig!.title,
        status: uniqueTransform(findingCounts),
        control: getIndexesByCciIds(identList, cciItems),
        cci: identList,
        systemsAffected: systemsList,
        findingDetails: detailsList,
        notes: poamComments,
        recommendations,
        mitigations,
      };

      findingsSheet.Findings.push(findingsSheetItem);
    }
  }
  return findingsSheet;
}

export function initializeCounts(): FindingCounts {
  return { Open: 0, NotAFinding: 0, Not_Applicable: 0, Not_Reviewed: 0 };
}

export function uniqueTransform(findings: FindingCounts): string {
  const { Open, NotAFinding, Not_Applicable, Not_Reviewed } = findings;

  if (Open) {
    return "Open";
  } else if (Not_Reviewed) {
    return "Not_Reviewed";
  } else if (NotAFinding) {
    return "NotAFinding";
  } else if (Not_Applicable) {
    return "Not_Applicable";
  } else {
    return "Unknown";
  }
}

export function addFindings(targetSum: FindingCounts, addends: FindingCounts) {
  for (const key in addends) {
    if (Object.prototype.hasOwnProperty.call(addends, key)) {
      targetSum[key] += addends[key];
    }
  }
}

export function uniqueTransformCounts(findings: FindingCounts): FindingCounts {
  const { Open, NotAFinding, Not_Applicable, Not_Reviewed } = findings;

  if (Open) {
    return { Open: 1, NotAFinding: 0, Not_Applicable: 0, Not_Reviewed: 0 };
  } else if (Not_Reviewed) {
    return { Open: 0, NotAFinding: 0, Not_Applicable: 0, Not_Reviewed: 1 };
  } else if (NotAFinding) {
    return { Open: 0, NotAFinding: 1, Not_Applicable: 0, Not_Reviewed: 0 };
  } else if (Not_Applicable) {
    return { Open: 0, NotAFinding: 0, Not_Applicable: 1, Not_Reviewed: 0 };
  } else {
    return { Open: 0, NotAFinding: 0, Not_Applicable: 0, Not_Reviewed: 0 };
  }
}

export function catFromSeverity(rawSeverity: string): string {
  type wordSeverity = "low" | "medium" | "high";
  type romanSeverity = "CAT I" | "CAT II" | "CAT III";
  const severityMap: Record<wordSeverity, romanSeverity> = {
    low: "CAT III",
    medium: "CAT II",
    high: "CAT I",
  };

  let Cat = "";
  if (rawSeverity === "low") {
    Cat = severityMap.low;
  } else if (rawSeverity === "medium") {
    Cat = severityMap.medium;
  } else if (rawSeverity === "high") {
    Cat = severityMap.high;
  }

  return Cat;
}
