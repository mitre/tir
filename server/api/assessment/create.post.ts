export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log(
    `Calling Create Assessment with SystemId: ${body.SystemId} and StigID: ${body.StigId}`,
  );
  const newAssessment = await createAssessment(body.SystemId, body.StigId);
  return newAssessment;
});
