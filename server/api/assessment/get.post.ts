import { Assessment, AssessmentItem, StigData } from "../../../db/models";
import { userCheck } from "~/server/utils/permissionCheck";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);
  if (checkResult.UserRoleId === 2 && checkResult.BoundaryRoleId) {
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
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "User not Permitted.",
    });
  }
});
