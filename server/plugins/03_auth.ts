import { waitForSignal } from "../utils/startupSync";
import { loadAuthConfig } from "~/server/utils/config/authConfig";
import { initializeAuthService } from "~/server/auth/authServiceManager";

export default defineNitroPlugin(async () => {
  await waitForSignal("db");
  const config = await loadAuthConfig();
  await initializeAuthService(config);
});
