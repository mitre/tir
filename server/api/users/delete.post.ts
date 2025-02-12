import { User } from "../../../db/models/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId !== 1) {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
  const user = await User.findByPk(body.id);
  await user?.destroy();
  logger.info({
    service: "auth",
    message: `User ${user?.email} Successfully Deleted`,
  });
  return { success: 1 };
});
