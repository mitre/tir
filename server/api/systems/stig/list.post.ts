import {
  Stig,
  System,
  SystemWithStigs,
  Assessment,
  AssessmentItem,
  StigLibrary,
  Boundary,
} from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const systemId = body.SystemId;
  await userCheck(event, body.SystemId, undefined, undefined);

  const boundary = await Boundary.findOne({
    include: [{ model: System, where: { id: systemId } }],
  });

  const system = (await System.findOne({
    where: { id: systemId },
    include: [
      {
        model: Stig,
        include: [
          {
            model: StigLibrary,
            where: { id: boundary?.StigLibraryId },
          },
          {
            model: Assessment,
            where: { SystemId: systemId, succeededByAssessmentId: null },
            required: false,
          },
        ],
      },
    ],
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
