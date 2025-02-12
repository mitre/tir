import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);
  if (checkResult.BoundaryRoleId && checkResult.BoundaryRoleId !== 4) {
    const override = await Override.destroy({
      where: {
        SystemId: body.SystemId,
        StigDatumId: body.StigDatumId,
      },
    });

    return override;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
