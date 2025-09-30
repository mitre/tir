import { Boundary, User, Boundary_User, UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.id, undefined);

  const boundary = await Boundary.findByPk(body.id, {
    include: [
      {
        model: Boundary_User,
      },
    ],
  });

  if (
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    await boundary?.destroy();
    logger.info({
      service: "Boundary",
      message: `User: ${checkResult.user?.email} Successfully Deleted Boundary:${boundary.name}`,
    });

    return { success: 1 };
  } else {
    logger.error(
      `${checkResult.user?.email} must be an Admin, Owner, or Co-Owner of ${boundary.name} to delete.`,
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to delete.",
    });
  }
});
