import { migrateBoundary } from "../../../server/utils/stigLibrary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { checkResult, boundary } = await requireBoundaryEditor(event, body.BoundaryId);

  const response = await migrateBoundary(body.BoundaryId, body.StigLibraryId);

  logger.info({
    service: "Boundary",
    message: `User: ${checkResult.user?.email} Edited Boundary STIG Baseline:"${boundary.name}" `,
  });
  return response;
});
