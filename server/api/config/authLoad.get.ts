import { loadAuthConfig } from "~/server/utils/authConfig";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const settings = await loadAuthConfig();

  return {
    authLocal: settings.enabledProviders.includes("local"),
    authLdap: settings.enabledProviders.includes("ldap"),
    authOidc: settings.enabledProviders.includes("oidc"),

    passwordLength: settings.config.local?.passwordLength,
    upperCount: settings.config.local?.upperCount,
    lowerCount: settings.config.local?.lowerCount,
    numberCount: settings.config.local?.numberCount,
    specialCount: settings.config.local?.specialCount,

    ldapUrl: settings.config.ldap?.ldapUrl,
    ldapBindDn: settings.config.ldap?.ldapBindDn,
    ldapBaseDn: settings.config.ldap?.ldapBaseDn,
    ldapPasswordSet: Boolean(settings.config.ldap?.ldapPassword),

    oidcUrl: settings.config.oidc?.oidcUrl,
    oidcClientId: settings.config.oidc?.oidcClientId,
    oidcCallback: settings.config.oidc?.oidcCallback,
    oidcGroupMappings: settings.config.oidc?.oidcGroupMappings,
    oidcSecretSet: Boolean(settings.config.oidc?.oidcSecret),
  };
});
