import { getEvaluationSummary } from "~/server/utils/evaluations";

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No Boundary specified",
    });
  }

  // if (!query.StigId) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: "No Stig specified",
  //   });
  // }

  const boundaryId = parseInt(query.BoundaryId?.toString(), 10);
  let stigId;
  if (query.StigId) {
    stigId = parseInt(query.StigId?.toString(), 10);

    if (isNaN(stigId)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid StigId ${query.StigId}`,
      });
    }
  }

  if (isNaN(boundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  let poam;
  if (query.poam) {
    if (query.poam === "true") {
      poam = true;
    }
  }

  const results = getEvaluationSummary(boundaryId, stigId, poam);
  return results;
});
