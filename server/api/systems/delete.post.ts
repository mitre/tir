import { System, Boundary, Boundary_User, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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
  const user = await User.findByPk(userId);
  const system = await System.findByPk(body.SystemId);
  const boundary = await Boundary.findByPk(body.BoundaryId, {
    attributes: ["id", "name", "ownerId"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  const isOwner = boundary?.dataValues.ownerId === userId;
  const isMember =
    boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId) !==
    undefined;
  if (isOwner || isMember) {
    if (
      !isOwner &&
      boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
        .BoundaryRoleId === 3
    ) {
      logger.error(`${user?.email} is unable to Delete System ${system?.name}`);
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Delete Systems",
      });
    } else {
      await system?.destroy();
      logger.info({
        service: "Boundary",
        message: `${user?.email} Successfully Deleted System: ${system?.name}`,
      });
      return system;
    }
  } else {
    logger.error(`${user?.email} is Not a Member of ${boundary?.name}`);
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});
