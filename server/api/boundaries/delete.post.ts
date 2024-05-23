import { Boundary, User, Boundary_User, UserRole } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const user = await User.findByPk(userId, {
    attributes: ["email"],
    include: [
      {
        model: UserRole,
        attributes: ["id", "name"],
      },
    ],
  });

  const body = await readBody(event);
  const boundary = await Boundary.findByPk(body.id, {
    include: [
      {
        model: Boundary_User,
      },
    ],
  });

  if (boundary?.dataValues.ownerId !== userId && user?.dataValues.UserRole.id !== 1) {
    if (boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)) {
      if (
        boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
          .BoundaryRoleId === 1
      ) {
        await boundary?.destroy();
        logger.info({
          service: "Boundary",
          message: `User: ${user?.email} Successfully Deleted Boundary:${boundary.name}`,
        });
      } else {
        logger.error(
          `${user?.email} must be an Admin, Owner, or Co-Owner of ${boundary.name} to delete.`,
        );
        throw createError({
          statusCode: 401,
          statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to delete.",
        });
      }
    } else {
      logger.error(
        `${user?.email} must be an Admin, Owner, or Co-Owner of ${boundary.name} to delete.`,
      );
      throw createError({
        statusCode: 401,
        statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to delete.",
      });
    }
  } else {
    await boundary?.destroy();
    logger.info({
      service: "Boundary",
      message: `User: ${user?.email} Successfully Deleted Boundary:${boundary?.name}`,
    });
  }
  return { success: 1 };
});
