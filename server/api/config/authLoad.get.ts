import { loadAuthConfig } from "~/server/utils/config/authConfig";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const settings = await loadAuthConfig();

  return settings;
});
