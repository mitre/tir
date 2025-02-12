import { getLogConfig } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId === 1) {
    try {
      return await getLogConfig();
    } catch (err) {
      logger.error("Unable to read log configuration");
      console.log(err);
      throw createError({
        statusCode: 404,
        statusMessage: "Erorr reading log configuration",
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
