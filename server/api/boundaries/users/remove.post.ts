import { User, Boundary, BoundaryInterface, Boundary_User } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    const user = await User.findByPk(body.UserId);
    const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;
    if (!user || !boundary) {
      if (!user) {
        logger.error(`Unable to find UserId`);
        return {
          success: false,
          error: "Unable to find UserId",
          id: body.UserId,
        };
      } else {
        logger.error(`Unable to find BoundaryId`);
        return {
          success: false,
          error: "Unable to find BoundaryId",
          id: body.BoundaryId,
        };
      }
    }
    const boundary_user = await Boundary_User.findOne({
      where: { BoundaryId: body.BoundaryId, UserId: body.UserId },
    });
    if (boundary_user?.dataValues.BoundaryRoleId === 1) {
      throw createError({
        statusCode: 401,
        statusMessage: "Set another User to Owner First",
      });
    } else {
      await boundary.removeUser(user);
      logger.info({
        service: "Boundary",
        message: `${user?.email} Successfully Removed from: ${boundary.name}`,
      });
      return { success: 1 };
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
