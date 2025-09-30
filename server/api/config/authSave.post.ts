import { saveAuthConfig, loadAuthConfig } from "~/server/utils/authConfig";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  await saveAuthConfig(body);

  const newConfig = await loadAuthConfig();

  const auth = getAuthServiceManager();
  await auth.reload(newConfig);

  return { success: true };
});
