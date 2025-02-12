import { System, Boundary, Boundary_User, User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);

  const system = await System.findByPk(body.SystemId);

  if (!system) {
    throw createError({
      statusCode: 404,
      statusMessage: "System not found.",
    });
  }

  const boundary = await Boundary.findByPk(system.BoundaryId, {
    attributes: ["id", "name"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });

  if (checkResult.BoundaryRoleId) {
    if (checkResult.BoundaryRoleId === 4) {
      logger.error(`${checkResult.user?.email} is unable to Delete System ${system?.name}`);
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Delete Systems",
      });
    } else {
      await system?.destroy();
      logger.info({
        service: "Boundary",
        message: `${checkResult.user?.email} Successfully Deleted System: ${system?.name}`,
      });
      return system;
    }
  } else {
    logger.error(`${checkResult.user?.email} is Not a Member of ${boundary?.name}`);
    throw createError({
      statusCode: 401,
      statusMessage: "Not a Member of this Boundary",
    });
  }
});
