import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);
  if (checkResult.BoundaryRoleId && checkResult.BoundaryRoleId !== 4) {
    body.lastUpdate = Date.now();
    const override = await Override.findByPk(body.id);
    override?.setDataValue("status", body.name);
    override?.save();
    return override;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
