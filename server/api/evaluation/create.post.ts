import { createEvaluation } from "../../utils/evaluations";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    console.log(
      `Calling Create Evaluation with BoundaryId: ${body.BoundaryId} and StigID: ${body.StigId}`,
    );
    const newEvaluation = await createEvaluation(body.BoundaryId, body.StigId);
    return newEvaluation;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
