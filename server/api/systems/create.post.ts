import { System, User, UserRole, Boundary, Boundary_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.lastUpdate = Date.now();
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

  const boundary = await Boundary.findByPk(body.BoundaryId, {
    attributes: ["id", "name", "ownerId"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  let system: any;
  if (boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)) {
    if (
      boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
        .BoundaryRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to edit Boundaries",
      });
    } else {
      system = await System.create(body);
    }
  } else if (boundary?.dataValues.ownerId === userId) {
    system = await System.create(body);
  }

  return system;
});
