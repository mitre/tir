import { Boundary, EvaluationItem, Milestone, NessusPlugin_Boundary, System } from "~/db/models";
import { Cve } from "~/db/models/cve";
import { NessusOverride } from "~/db/models/nessusOverride";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }

  if (!query.VulnId) {
    throw createError({
      statusCode: 400,
      statusMessage: `VulnId required.`,
    });
  }

  const BoundaryId = parseInt(query.BoundaryId?.toString(), 10);
  const VulnId = parseInt(query.VulnId?.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  if (isNaN(VulnId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid VulnId ${query.VulnId}`,
    });
  }

  let results = await NessusPlugin.findOne({
    include: [
      { model: Cve, required: true },
      {
        model: NessusReportItem,
        attributes: [
          "id",
          "pluginOutput",
          "cvssTemporalScore",
          "cvss3TemporalScore",
          "statusOverride",
          "statusOverrideJustification",
          "severityOverride",
          "severityOverrideJustification",
        ],
        required: true,
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
                    model: NessusOverride,
                    attributes: ["type", "value", "SystemId"],
                  },
                  {
                    model: Boundary,
                    attributes: [],
                    where: { id: BoundaryId },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: NessusOverride,
        attributes: ["id", "type", "value", "SystemId"],
      },

      {
        model: NessusPlugin_Boundary,
        // attributes: [],
        where: { BoundaryId },
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
    where: { id: VulnId },
  });

  if (sequelize.getDialect() === "postgres" && results) {
    const newResults = results.toJSON();

    newResults.NessusPlugin_Boundaries.forEach((item) => {
      if (item.EvaluationItem) {
        if (item.EvaluationItem.Scheduled_Completion_Dat !== undefined) {
          item.EvaluationItem.Scheduled_Completion_Date =
            item.EvaluationItem.Scheduled_Completion_Dat;
          delete item.EvaluationItem.Scheduled_Completion_Dat;
        }

        item.EvaluationItem.Milestones.forEach((milestone) => {
          if (milestone.completion_da !== undefined) {
            milestone.completion_date = milestone.completion_da;
            delete milestone.completion_da;
          }
          if (milestone.EvaluationIte !== undefined) {
            milestone.EvaluationItemId = milestone.EvaluationIte;
            delete milestone.EvaluationIte;
          }
        });
      }
    });
    return newResults;
  }

  return results;
});
