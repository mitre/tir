import { migrateBoundary } from "../../../server/utils/stigLibrary";

import { Boundary, Boundary_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);

  const boundary = await Boundary.findByPk(body.BoundaryId, {
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  if (!boundary) {
    logger.error(`No Boundary found for id: ${body.id}.`);
    throw createError({
      statusCode: 404,
      statusMessage: `No Boundary found for id: ${body.id}.`,
    });
  }
  const originalBoundary = boundary?.name;

  if (
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    const response = await migrateBoundary(body.BoundaryId, body.StigLibraryId);

    logger.info({
      service: "Boundary",
      message: `User: ${checkResult.user?.email} Edited Boundary STIG Baseline:"${originalBoundary}" `,
    });
    return response;
  } else {
    logger.error(
      `${checkResult.user?.email} must be an Admin, Owner, or Co-Owner of ${boundary.name} to Edit.`,
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to Edit.",
    });
  }
});
