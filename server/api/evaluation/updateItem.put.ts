import { EvaluationItem, Milestone, MilestoneInterface } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const evaluationItem = await EvaluationItem.findByPk(body.id, { include: { model: Milestone } });

  const milestoneArray = [];
  if (evaluationItem) {
    const previousMilestones = evaluationItem.previous("Milestones");

    for (let i = 0; i < previousMilestones.length; i++) {
      milestoneArray.push(previousMilestones[i].dataValues.id);
    }

    for (let i = 0; i < body.Milestone.length; i++) {
      const milestone = await Milestone.findOrCreate({
        where: {
          item: body.Milestone[i],
          completion_date: body.Milestone_Completion_Dte[i],
          EvaluationItemId: body.id,
        },
      });
      const mID = milestone[0].dataValues.id;

      if (milestoneArray.findIndex((o) => o === mID) != -1) {
        milestoneArray.splice(
          milestoneArray.findIndex((o) => o === mID),
          1,
        );
      }

      const myMilestone: MilestoneInterface = milestone[0] as MilestoneInterface;
      myMilestone.addEvaluationItem(body.id);
    }
    for (let i = 0; i < milestoneArray.length; i++) {
      const myMilestone: MilestoneInterface = (await Milestone.findByPk(
        milestoneArray[i],
      )) as MilestoneInterface;
      await myMilestone.removeEvaluationItem(body.id);
      await myMilestone.destroy();
    }

    delete body.Milestone;
    delete body.Milestone_Completion_Dte;
    for (const key in body) {
      evaluationItem.setDataValue(key, body[key]);
    }

    evaluationItem.save();
    return { error: false };
  } else {
    return { error: true, errorMsg: `Evaluation Item: ${body.id} not found.` };
  }
});
