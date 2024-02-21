import { Op } from "sequelize";
import {
  Evaluation,
  Stig,
  EvaluationItem,
  StigData,
  AssessmentItem,
  Assessment,
  System,
  Override,
  Milestone,
  StigIdent,
} from "../../db/models";
import { uniqueTransform, addFindings } from "./findings";

export type EvalSummaryOverride = {
  status: string;
  System: {
    name: string;
  };
};

export type EvalSummaryMilestone = {
  item: string;
  completion_date: string;
};

export type EvalSummaryEvaluationItem = {
  id: number;
  Office_Org: string;
  Resources_Required: string;
  Scheduled_Completion_Date: string;
  Milestone_Changes: string;
  Poam_Comments: string;
  Mitigations: string;
  Severity: string;
  Relevance_of_Threat: string;
  Likelihood: string;
  Impact: string;
  Impact_Description: string;
  Residual_Risk_Level: string;
  Recommendations: string;
  lastUpdate: string;
  creationDate: string;
  Milestones: EvalSummaryMilestone[];
};

export type EvalSummaryAssessmentItem = {
  status: string;
  comments: string;
  finding_details: string;
  Assessment: {
    id: number;
    System: {
      name: string;
    };
  };
};

export type EvalSummaryStigIdent = {
  text: string;
};

export type EvalSummaryStigData = {
  id: number;
  vuln_num: string;
  group_title: string;
  description: string;
  rule_id: string;
  severity: string;
  weight: number;
  rule_ver: string;
  rule_title: string;
  vuln_discuss: string;
  false_positives: string;
  false_negatives: string;
  documentable: boolean;
  mitigations: string;
  security_override_guidance: string;
  potential_impact: string;
  third_party_tools: string;
  mitigation_control: string;
  responsibility: null;
  ia_controls: string;
  check__system: string;
  check_check_content: string;
  check_check_content_ref__name: string;
  check_check_content_ref__href: string;
  fix__id: string;
  fixtext: string;
  fixtext__fixref: string;
  lastUpdate: string;
  creationDate: string;
  status: string;
  AssessmentItems: EvalSummaryAssessmentItem[];
  EvaluationItems: EvalSummaryEvaluationItem[];
  Overrides: EvalSummaryOverride[];
  StigIdents: EvalSummaryStigIdent[];
};

export type EvalSummary = {
  title: string;
  version: number;
  stigRelease: number;
  stigDate: string;
  StigData: EvalSummaryStigData[];
};

export async function createEvaluation(
  boundaryId: number,
  stigId: number,
): Promise<{ error: boolean; errmsg: string }> {
  const initialCheck = await Evaluation.findOne({
    where: {
      BoundaryId: boundaryId,
      StigId: stigId,
    },
  });

  if (initialCheck) {
    console.log("Error.  Evaluation already exists.");
  } else {
    console.log("Truely nothing out there.  Need to make one.");

    const newEvaluation = await Evaluation.create({
      BoundaryId: boundaryId,
      StigId: stigId,
      comment: "TIR",
      classification: "U",
    });

    const stigChecks = await StigData.findAll({
      include: [
        {
          model: Stig,
          where: { id: stigId },
        },
      ],
    });

    for (const check of stigChecks) {
      await EvaluationItem.create({
        // status: "Not_Reviewed",
        EvaluationId: newEvaluation.dataValues.id,
        StigDatumId: check.dataValues.id,
      });
    }
  }

  return { error: false, errmsg: "" };
}

export async function getEvaluationSummary(
  boundaryId: number,
  stigId?: number,
  poam?: boolean,
): Promise<EvalSummary[]> {
  const perfTimer = new PerfTimer();

  let stigWhereClause = {};
  if (stigId) {
    stigWhereClause = { id: stigId };
  }

  let statusWhereCluase = {};
  if (poam) {
    statusWhereCluase = { status: "Open" };
  }

  perfTimer.start("Query");
  const results = await Stig.findAll({
    attributes: ["title", "version", "stigRelease", "stigDate"],
    where: stigWhereClause,
    include: [
      {
        through: { attributes: [] },
        model: StigData,
        required: true,
        include: [
          {
            model: AssessmentItem,
            required: true,
            attributes: ["status", "comments", "finding_details"],
            where: statusWhereCluase,
            include: [
              {
                model: Assessment,
                attributes: ["id"],
                required: true,
                include: [
                  {
                    model: System,
                    attributes: ["name"],
                    where: { BoundaryId: boundaryId },
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            model: EvaluationItem,
            required: true,
            include: [
              {
                model: Milestone,
                attributes: ["item", "completion_date"],
              },
              {
                model: Evaluation,
                attributes: [],
                where: { BoundaryId: boundaryId },
                required: true,
              },
            ],
          },
          {
            model: Override,
            attributes: ["status"],
            include: [
              {
                model: System,
                attributes: ["name"],
                where: { BoundaryId: boundaryId },
                required: true,
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
        ],
      },
    ],
  });
  perfTimer.stop("Query");

  const evalSummary: EvalSummary[] = [];

  perfTimer.start("New Findings Object");
  if (results?.length > 0) {
    for (const stig of results) {
      const evalSummaryItem: EvalSummary = {
        title: stig.title,
        version: parseInt(stig.version, 10),
        stigRelease: stig.stigRelease,
        stigDate: stig.stigDate,
        StigData: [],
      };

      type SystemFindingCounts = { findings: FindingCounts; systemName: string };

      if (stig?.StigData) {
        for (const stigData of stig?.StigData) {
          const systemFindingCounts: SystemFindingCounts[] = [];

          const overrides = [];

          const newEvalItems: EvalSummaryEvaluationItem[] = [];

          const stigIdents: EvalSummaryStigIdent[] = [];

          if (stigData?.EvaluationItems && stigData.EvaluationItems[0]?.Milestones) {
            const milestones = [];
            for (const milestone of stigData.EvaluationItems[0].Milestones) {
              const newMilestone: EvalSummaryMilestone = {
                item: milestone.item,
                completion_date: milestone.completion_date,
              };
              milestones.push(newMilestone);
            }

            newEvalItems.push({
              id: stigData.EvaluationItems[0].id,
              Office_Org: stigData.EvaluationItems[0].Office_Org,
              Resources_Required: stigData.EvaluationItems[0].Resources_Required,
              Scheduled_Completion_Date: stigData.EvaluationItems[0].Scheduled_Completion_Date,
              Milestone_Changes: stigData.EvaluationItems[0].Milestone_Changes,
              Poam_Comments: stigData.EvaluationItems[0].Poam_Comments,
              Mitigations: stigData.EvaluationItems[0].Mitigations,
              Severity: stigData.EvaluationItems[0].Severity,
              Relevance_of_Threat: stigData.EvaluationItems[0].Relevance_of_Threat,
              Likelihood: stigData.EvaluationItems[0].Likelihood,
              Impact: stigData.EvaluationItems[0].Impact,
              Impact_Description: stigData.EvaluationItems[0].Impact_Description,
              Residual_Risk_Level: stigData.EvaluationItems[0].Residual_Risk_Level,
              Recommendations: stigData.EvaluationItems[0].Recommendations,
              lastUpdate: stigData.EvaluationItems[0].lastUpdate,
              creationDate: stigData.EvaluationItems[0].creationDate,
              Milestones: milestones,
            });
          }

          const newAssessmentItems: EvalSummaryAssessmentItem[] = [];

          if (stigData.AssessmentItems) {
            for (const assessmentItem of stigData.AssessmentItems) {
              newAssessmentItems.push({
                status: assessmentItem.status,
                comments: assessmentItem.comments,
                finding_details: assessmentItem.finding_details,
                Assessment: {
                  id: assessmentItem.Assessment?.id!,
                  System: {
                    name: assessmentItem.Assessment?.System?.name!,
                  },
                },
              });
              const count: FindingCounts = initializeCounts();
              count[assessmentItem.status]++;

              const newFindingCount: SystemFindingCounts = {
                findings: count,
                systemName: assessmentItem.Assessment?.System?.name!,
              };

              systemFindingCounts.push(newFindingCount);
            }
          }

          if (stigData.Overrides) {
            for (const override of stigData.Overrides) {
              const newOverride: EvalSummaryOverride = {
                status: override.status,
                System: {
                  name: override.System.name,
                },
              };
              overrides.push(newOverride);

              const index = systemFindingCounts.findIndex(
                (item) => item.systemName === override.System.name,
              );
              if (index !== -1) {
                const newCount = initializeCounts();
                newCount[override.status]++;
                systemFindingCounts[index] = {
                  findings: newCount,
                  systemName: override.System.name,
                };
              }
            }
          }
          const totalCount = initializeCounts();
          for (const count of systemFindingCounts) {
            addFindings(totalCount, count.findings);
          }

          if (stigData.StigIdents) {
            for (const stigIdent of stigData.StigIdents) {
              const stigIdentToAdd: EvalSummaryStigIdent = {
                text: stigIdent.text,
              };
              stigIdents.push(stigIdentToAdd);
            }
          }

          evalSummaryItem.StigData.push({
            id: stigData.id,
            vuln_num: stigData.vuln_num,
            group_title: stigData.group_title,
            description: stigData.description,
            rule_id: stigData.rule_id,
            severity: stigData.severity,
            weight: parseInt(stigData.weight, 10),
            rule_ver: stigData.rule_ver,
            rule_title: stigData.rule_title,
            vuln_discuss: stigData.vuln_discuss,
            false_positives: stigData.false_positives,
            false_negatives: stigData.false_negatives,
            documentable: stigData.documentable === "true",
            mitigations: stigData.mitigations,
            security_override_guidance: stigData.security_override_guidance,
            potential_impact: stigData.potential_impact,
            third_party_tools: stigData.third_party_tools,
            mitigation_control: stigData.mitigation_control,
            responsibility: null,
            ia_controls: stigData.ia_controls,
            check__system: stigData.check__system,
            check_check_content: stigData.check_check_content,
            check_check_content_ref__name: stigData.check_check_content_ref__name,
            check_check_content_ref__href: stigData.check_check_content_ref__href,
            fix__id: stigData.fix__id,
            fixtext: stigData.fixtext,
            fixtext__fixref: stigData.fixtext__fixref,
            lastUpdate: stigData.lastUpdate,
            creationDate: stigData.creationDate,
            status: uniqueTransform(totalCount),
            AssessmentItems: newAssessmentItems,
            EvaluationItems: newEvalItems,
            Overrides: overrides,
            StigIdents: stigIdents,
          });
        }
        evalSummary.push(evalSummaryItem);
      }
      // type EvalSummaryOverride = {
    }
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: `No Evals found with BoundaryId: ${boundaryId} and StigId: ${stigId}.`,
    });
  }
  perfTimer.stop("New Findings Object");

  perfTimer.globalSummaryPrint();

  return evalSummary;
}

// export async function getEvaluations(boundaryId: number, stigId?: number) {
//   let whereClause;
//   if (stigId) {
//     whereClause = { BoundaryId: boundaryId, StigId: stigId };
//   } else {
//     whereClause = { BoundaryId: boundaryId };
//   }

//   const results = await Evaluation.findAll({
//     where: whereClause,
//     include: [
//       {
//         model: EvaluationItem,
//         duplicating: false,
//         include: [
//           {
//             model: StigData,
//             duplicating: false,
//             include: [
//               {
//                 model: AssessmentItem,
//                 // attributes: ["status"],
//                 duplicating: false,
//                 include: [
//                   {
//                     model: Assessment,
//                     // attributes: [],
//                     duplicating: false,
//                     required: true,
//                     include: [
//                       {
//                         model: System,
//                         // attributes: [],
//                         duplicating: false,
//                         where: {
//                           BoundaryId: boundaryId,
//                         },
//                       },
//                     ],
//                   },
//                 ],
//               },
//               {
//                 model: Override,
//                 include: [
//                   {
//                     model: System,
//                     attributes: [],
//                     duplicating: false,
//                     where: {
//                       BoundaryId: boundaryId,
//                     },
//                   },
//                 ],
//               },
//               {
//                 model: StigIdent,
//               },
//             ],
//           },
//           {
//             model: Milestone,
//             duplicating: false,
//           },
//         ],
//       },
//     ],
//   });

//   if (results.length === 0) {
//     throw createError({
//       statusCode: 404,
//       statusMessage: "No Evaluation Found",
//     });
//   }

//   type FindingStatus = {
//     open: number;
//     closed: number;
//     notApplicable: number;
//     notReviewed: number;
//     [key: string]: number;
//   };

//   function addFindings(targetSum: FindingStatus, addends: FindingStatus) {
//     for (const key in addends) {
//       if (addends.hasOwnProperty(key)) {
//         targetSum[key] += addends[key];
//       }
//     }
//   }

//   function uniqueTransform(findings: FindingStatus): string {
//     const { open, closed, notApplicable, notReviewed } = findings;

//     if (open) {
//       return "Open";
//     } else if (notReviewed) {
//       return "Not_Reviewed";
//     } else if (closed) {
//       return "NotAFinding";
//     } else if (notApplicable) {
//       return "Not_Applicable";
//     } else {
//       return "";
//     }
//   }

//   for (let x = 0; x < results.length; x++) {
//     for (let i = 0; i < results[x].dataValues.EvaluationItems.length; i++) {
//       const systemList: string[] = [];

//       const tempCounts: FindingStatus = { open: 0, closed: 0, notApplicable: 0, notReviewed: 0 };
//       for (
//         let j = 0;
//         j < results[x].dataValues.EvaluationItems[i].StigDatum.AssessmentItems.length;
//         j++
//       ) {
//         const systemName =
//           results[x].dataValues.EvaluationItems[i].StigDatum.AssessmentItems[j].Assessment.System
//             .dataValues.name;
//         if (systemList.findIndex((o) => o === systemName) === -1) {
//           systemList.push(systemName);
//         }
//         const assessmentItemStatus =
//           results[x].dataValues.EvaluationItems[i].StigDatum.AssessmentItems[j].status;
//         const indexedFindings = {
//           open: assessmentItemStatus === "Open" ? 1 : 0,
//           closed: assessmentItemStatus === "NotAFinding" ? 1 : 0,
//           notReviewed: assessmentItemStatus === "Not_Reviewed" ? 1 : 0,
//           notApplicable: assessmentItemStatus === "Not_Applicable" ? 1 : 0,
//         };

//         addFindings(tempCounts, indexedFindings);
//       }

//       results[x].dataValues.EvaluationItems[i].dataValues.StigDatum.dataValues.status =
//         uniqueTransform(tempCounts);
//       // delete results[0].dataValues.EvaluationItems[i].dataValues.StigDatum.dataValues.AssessmentItems;
//       results[x].dataValues.EvaluationItems[i].dataValues.systems = systemList;
//     }
//   }
//   return results;
// }
