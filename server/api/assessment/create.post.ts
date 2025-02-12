export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);
  if (checkResult.UserRoleId === 2 && checkResult.BoundaryRoleId) {
    console.log(
      `Calling Create Assessment with SystemId: ${body.SystemId} and StigID: ${body.StigId}`,
    );
    const newAssessment = await findOrCreateAssessment(body.SystemId, body.StigId);
    await createEvaluation(body.BoundaryId, body.StigId);
    return newAssessment;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "User not Permitted.",
    });
  }
});
