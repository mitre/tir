import { Assessment, AssessmentItem, StigData } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const assessmentQueryResults = await Assessment.findOne({
    where: {
      SystemId: body.SystemId,
      StigId: body.StigId,
    },
  });

  if (assessmentQueryResults && assessmentQueryResults.dataValues.id) {
    const assessment = await AssessmentItem.findAll({
      where: {
        AssessmentId: assessmentQueryResults.dataValues.id,
      },
      include: {
        model: StigData,
      },
    });

    return assessment;
  } else {
    return { error: true, errorMsg: "No Assessments found." };
  }
});
