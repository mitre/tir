import { User } from "../../../db/models/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.id);
  await user?.destroy();
  logger.info({
    service: "auth",
    message: `User ${user?.email} Successfully Deleted`,
  });
  return { success: 1 };
});
