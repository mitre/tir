import { loadAuthConfig } from "~/server/utils/authConfig";
import { initializeAuthService } from "~/server/auth/authServiceManager";

export default defineNitroPlugin(async () => {
  const config = await loadAuthConfig();
  await initializeAuthService(config);
});
