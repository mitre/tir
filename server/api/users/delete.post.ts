import { User } from "../../../db/models/user";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await User.findByPk(body.id);
  await user?.destroy();
  return { success: 1 };
});
