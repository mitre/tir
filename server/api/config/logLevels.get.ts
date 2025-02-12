export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId === 1) {
    return logger.levels;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
