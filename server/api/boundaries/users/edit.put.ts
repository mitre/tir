import {
  Boundary,
  BoundaryRole,
  Boundary_User,
  User,
  BoundaryInterface,
} from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.UserRoleId === 1
  ) {
    const user = await User.findByPk(body.UserId);
    const role = await BoundaryRole.findByPk(body.BoundaryRoleId);
    const boundary = (await Boundary.findByPk(body.BoundaryId)) as BoundaryInterface;

    const boundary_user = await Boundary_User.findOne({
      where: { BoundaryId: body.BoundaryId, UserId: body.UserId },
    });

    if (body.BoundaryRoleId === 1) {
      const currentOwner = await Boundary_User.findOne({
        where: { BoundaryId: body.BoundaryId, BoundaryRoleId: body.BoundaryRoleId },
      });
      if (currentOwner?.dataValues.UserId === body.UserId) {
        boundary_user?.setDataValue("BoundaryRoleId", body.BoundaryRoleId);
        await boundary_user?.save();
      } else {
        currentOwner?.setDataValue("BoundaryRoleId", 2);
        await currentOwner?.save();
        boundary_user?.setDataValue("BoundaryRoleId", body.BoundaryRoleId);
        await boundary_user?.save();
      }
    } else if (boundary_user?.dataValues.BoundaryRoleId === 1) {
      throw createError({
        statusCode: 401,
        statusMessage: "Set another User to Owner First",
      });
    } else {
      boundary_user?.setDataValue("BoundaryRoleId", body.BoundaryRoleId);
      boundary_user?.save();
    }

    logger.info({
      service: "Boundary",
      message: `${boundary?.name}: user ${user?.email} role updated to: ${role?.name}`,
    });
    return boundary_user;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
