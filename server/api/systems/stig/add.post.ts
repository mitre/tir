import { Stig, System, SystemInterface, Boundary, Boundary_User } from "../../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const stig = await Stig.findByPk(body.StigId);
  const system = (await System.findByPk(body.SystemId)) as SystemInterface;

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
  const isOwner = boundary?.dataValues.ownerId === userId;
  const isMember =
    boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId) !==
    undefined;

  if (!stig || !system) {
    if (!stig) {
      return {
        success: false,
        error: "Unable to find StigId",
        id: body.StigId,
      };
    } else {
      return {
        success: false,
        error: "Unable to find SystemId",
        id: body.SystemId,
      };
    }
  }
  if (isOwner || isMember) {
    if (
      !isOwner &&
      boundary?.dataValues.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId)
        .BoundaryRoleId === 3
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Add STIGs",
      });
    } else {
      await system.addStig(stig);
      return { success: true };
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});
