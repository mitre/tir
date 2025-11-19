import { createControlRecords } from "../../utils/controls";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    logger.info({
      service: "SCTM",
      message: `Calling Create Control Record with BoundaryId: ${body.BoundaryId} and Control Family: ${body.controlFamily}`,
    });

    const newControlRecord = await createControlRecords(body.BoundaryId, body.controlRev);
    return newControlRecord;
  } else {
    throw createError({
      statusCode: 403,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
