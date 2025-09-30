import { loadAuthConfig } from "~/server/utils/authConfig";

export default defineEventHandler(async () => {
  const settings = await loadAuthConfig();

  return {
    local: settings.enabledProviders.includes("local"),
    ldap: settings.enabledProviders.includes("ldap"),
    oidc: settings.enabledProviders.includes("oidc"),
  };
});
