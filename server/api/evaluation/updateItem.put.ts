import {
  EvaluationItem,
  Milestone,
  MilestoneInterface,
  Boundary,
  Boundary_User,
} from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const boundary = await Boundary.findByPk(body.BoundaryId, {
    attributes: ["id", "name", "ownerId"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  const isOwner = boundary?.dataValues.ownerId === userId;
  const isMember =
    boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId) !==
    undefined;

  if (isOwner || isMember) {
    if (
      !isOwner &&
      boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
        .BoundaryRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Edit Evaluations",
      });
    } else {
      const evaluationItem = await EvaluationItem.findByPk(body.id, {
        include: { model: Milestone },
      });

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
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});
