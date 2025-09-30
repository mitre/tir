import { System } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const checkResult = await userCheck(event, query.SystemId?.toString(), undefined, undefined);

  if (!query.SystemId) {
    throw createError({
      statusCode: 400,
      statusMessage: `SystemId required.`,
    });
  }
  if (checkResult.BoundaryRoleId) {
    const SystemId = parseInt(query.SystemId?.toString(), 10);

    if (isNaN(SystemId)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid SystemId ${query.SystemId}`,
      });
    }
    const system = await System.findByPk(SystemId);
    return system;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
