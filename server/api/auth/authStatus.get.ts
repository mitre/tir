import { loadAuthConfig } from "~/server/utils/config/authConfig";

export default defineEventHandler(async () => {
  const settings = await loadAuthConfig();

  return {
    local: settings.local.enable,
    ldapProviders: settings.ldap.filter((p) => p.enable).map((p) => ({ id: p.id, label: p.label })),
    oidcProviders: settings.oidc.filter((p) => p.enable).map((p) => ({ id: p.id, label: p.label })),
    oauthProviders: settings.oauth.filter((p) => p.enable).map((p) => ({ id: p.id, label: p.label })),
    defaultLoginProvider: settings.defaultLoginProvider,
  };
});
