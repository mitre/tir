import { DateTime } from "luxon";
import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, body.SystemId, undefined, undefined);
  if (checkResult.BoundaryRoleId && checkResult.BoundaryRoleId !== 4) {
    body.createdDate = DateTime.now().toISO();

    const override = await Override.create(body);

    return override;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
