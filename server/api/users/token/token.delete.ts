import { Token } from "../../../../db/models/index";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const token = await Token.findByPk(body.id);
  await token?.destroy();
  logger.info({
    service: "Token",
    message: `Successfully Deleted Token: ${token?.name}`,
  });
  return { success: true };
});
