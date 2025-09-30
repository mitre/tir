import { System, Boundary, Boundary_User } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);

  const system = await System.findByPk(body.SystemId);
  const boundary = await Boundary.findByPk(body.BoundaryId, {
    attributes: ["id", "name"],
    include: [
      {
        model: Boundary_User,
      },
    ],
  });
  if (!system) {
    logger.error(`No System found for id: ${body.SystemId}.`);
    throw createError({
      statusCode: 404,
      statusMessage: `No System found for id: ${body.SystemId}.`,
    });
  }

  if (checkResult.BoundaryRoleId) {
    if (checkResult.BoundaryRoleId === 4) {
      logger.error(`${checkResult.user?.email} is unable to Edit System ${system?.name}`);
      throw createError({
        statusCode: 401,
        statusMessage: "Reviewers are unable to Edit Systems",
      });
    } else {
      for (const key in body) {
        system?.setDataValue(key, body[key]);
      }
      logger.info({
        service: "Boundary",
        message: `${checkResult.user?.email} Successfully Edited System: ${system?.name}`,
      });
      system?.save();
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
