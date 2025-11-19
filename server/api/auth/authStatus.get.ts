import { loadAuthConfig } from "~/server/utils/config/authConfig";

export default defineEventHandler(async () => {
  const settings = await loadAuthConfig();

  return {
    local: settings.local.enable,
    ldap: settings.ldap.enable,
    oidc: settings.oidc.enable,
  };
});
