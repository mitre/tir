import { Stig, System, SystemWithStigs, Assessment, AssessmentItem } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const systemId = body.SystemId;

  const system = (await System.findOne({
    where: { id: systemId },
    include: Stig,
  })) as SystemWithStigs;
  for (let i = 0; i < system.Stigs.length; i++) {
    const assessmentQueryResults = await Assessment.findOne({
      where: {
        SystemId: body.SystemId,
        StigId: system.Stigs[i].dataValues.id,
      },
    });

    if (assessmentQueryResults && assessmentQueryResults.dataValues.id) {
      const assessment = await AssessmentItem.findAll({
        where: {
          AssessmentId: assessmentQueryResults.dataValues.id,
          current: true,
        },
        attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
        group: ["status"],
      });

      system.Stigs[i].dataValues.finding_status = assessment;
    }
  }
  return system.Stigs;
});
