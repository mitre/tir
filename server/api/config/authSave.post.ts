import { saveAuthConfig, loadAuthConfig } from "~/server/utils/config/authConfig";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  await saveAuthConfig(body);

  const newConfig = await loadAuthConfig();

  const auth = getAuthServiceManager();
  await auth.reload(newConfig);

  return { success: true };
});
