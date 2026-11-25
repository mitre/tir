import { checkBoundary } from "../../../server/utils/stigLibrary";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await requireBoundaryEditor(event, body.BoundaryId);
  return checkBoundary(body.BoundaryId, body.StigLibraryId);
});
