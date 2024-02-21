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
    attributes: [],
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
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to delete.",
        });
      }
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: "Must be an Admin, Owner, or Co-Owner of this Enclave to delete.",
      });
    }
  } else {
    await boundary?.destroy();
  }
  return { success: 1 };
});
