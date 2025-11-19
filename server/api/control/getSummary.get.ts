import { getControlSummary } from "~/server/utils/controls";

export default defineEventHandler(async (event) => {
  const query = await getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 404,
      statusMessage: "No Boundary specified",
    });
  }
  if (!query.controlRecordId) {
    throw createError({
      statusCode: 404,
      statusMessage: "No Control Record specified",
    });
  }
  const checkResult = await userCheck(event, undefined, query.BoundaryId.toString(), undefined);
  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Insufficient Permissions.",
    });
  }

  const boundaryId = parseInt(query.BoundaryId?.toString(), 10);

  if (isNaN(boundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const results = getControlSummary(Number(query.BoundaryId), Number(query.controlRecordId));
  return results;
});
