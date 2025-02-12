import { DateTime } from "luxon";
import { Evaluation, EvaluationItem, Milestone, Boundary, Boundary_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.lastUpdate = DateTime.now().toISO();
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);

  if (checkResult.BoundaryRoleId) {
    if (checkResult.BoundaryRoleId === 4) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Edit Evaluations",
      });
    } else {
      const evaluationItem = await EvaluationItem.findByPk(body.id, {
        include: [{ model: Milestone }, { model: Evaluation }],
      });
      const milestoneArray = [];
      if (evaluationItem) {
        const previousMilestones = evaluationItem.previous("Milestones");

        for (let i = 0; i < previousMilestones.length; i++) {
          milestoneArray.push(previousMilestones[i].dataValues.id);
        }

        for (let i = 0; i < body.Milestone.length; i++) {
          if (!body.Milestone_Completion_Dte[i] || !body.Milestone[i]) {
            throw createError({
              statusCode: 401,
              statusMessage: "Please provide text and a completion date for your milestones",
            });
          }
          const milestone = await Milestone.findOrCreate({
            where: {
              item: body.Milestone[i],
              completion_date: body.Milestone_Completion_Dte[i],
              EvaluationItemId: body.id,
            },
          });
          const mID = milestone[0].dataValues.id;

          if (milestoneArray.findIndex((o) => o === mID) !== -1) {
            milestoneArray.splice(
              milestoneArray.findIndex((o) => o === mID),
              1,
            );
          }
        }
        for (let i = 0; i < milestoneArray.length; i++) {
          const milestone = await Milestone.findByPk(milestoneArray[i]);
          await milestone?.destroy();
        }

        delete body.Milestone;
        delete body.Milestone_Completion_Dte;
        for (const key in body) {
          evaluationItem.setDataValue(key, body[key]);
        }
        if(evaluationItem.Evaluation){
          evaluationItem.Evaluation.setDataValue("lastUpdate", body.lastUpdate);
          evaluationItem.Evaluation.save();
          evaluationItem.save();
        }
        return { error: false };
      } else {
        return { error: true, errorMsg: `Evaluation Item: ${body.id} not found.` };
      }
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});
