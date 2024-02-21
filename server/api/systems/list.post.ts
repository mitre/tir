import { System, AssessmentItem, Assessment } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const system = await System.findAll({ where: { BoundaryId: body.boundary } });
  for (let i = 0; i < system.length; i++) {
    const assessments = await Assessment.findAll({
      where: {
        SystemId: system[i].dataValues.id,
      },
    });
    const ids = assessments.map((assessment) => assessment.dataValues.id);
    const assessmentItems = await AssessmentItem.findAll({
      where: {
        AssessmentId: ids,
      },
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
      group: ["status"],
    });
    system[i].dataValues.finding_status = assessmentItems;
  }

  return system;
});
