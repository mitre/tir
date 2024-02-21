import { createEvaluation } from "../../utils/evaluations";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log(
    `Calling Create Evaluation with BoundaryId: ${body.BoundaryId} and StigID: ${body.StigId}`,
  );
  const newEvaluation = await createEvaluation(body.BoundaryId, body.StigId);
  return newEvaluation;
});
