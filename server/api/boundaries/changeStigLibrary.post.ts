import { migrateBoundary } from "../../../server/utils/stigLibrary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await migrateBoundary(body.BoundaryId, body.StigLibraryId);
  return response;
});
