import { getConfigValues, getStr, getBool, getNum, setValue } from "./tirConfig";
import type { AuthSettings, AuthProviderType } from "~/server/auth/authServiceManager";

const DEFAULT_PASSWORD_LENGTH = 8;
const DEFAULT_UPPER_COUNT = 0;
const DEFAULT_LOWER_COUNT = 0;
const DEFAULT_NUMBER_COUNT = 0;
const DEFAULT_SPECIAL_COUNT = 0;

export async function loadAuthConfig(): Promise<AuthSettings> {
  const config = await getConfigValues("auth");

  const getScoped = (prefix: string) => config.filter((c) => c.key.startsWith(`${prefix}_`));

  const localConfig = getScoped("auth_local");
  const ldapConfig = getScoped("auth_ldap");
  const oidcConfig = getScoped("auth_oidc");

  const enabledProviders: AuthProviderType[] = [];
  if (getBool(config, "enable_local", "auth")) enabledProviders.push("local");
  if (getBool(config, "enable_ldap", "auth")) enabledProviders.push("ldap");
  if (getBool(config, "enable_oidc", "auth")) enabledProviders.push("oidc");

  return {
    enabledProviders,
    config: {
      local: {
        passwordLength:
          getNum(localConfig, "password_length", "auth_local") ?? DEFAULT_PASSWORD_LENGTH,
        upperCount: getNum(localConfig, "upper_count", "auth_local") ?? DEFAULT_UPPER_COUNT,
        lowerCount: getNum(localConfig, "lower_count", "auth_local") ?? DEFAULT_LOWER_COUNT,
        numberCount: getNum(localConfig, "number_count", "auth_local") ?? DEFAULT_NUMBER_COUNT,
        specialCount: getNum(localConfig, "special_count", "auth_local") ?? DEFAULT_SPECIAL_COUNT,
      },
      ldap: {
        ldapUrl: getStr(ldapConfig, "url", "auth_ldap"),
        ldapBindDn: getStr(ldapConfig, "bind_dn", "auth_ldap"),
        ldapPassword: getStr(ldapConfig, "password", "auth_ldap"),
        ldapBaseDn: getStr(ldapConfig, "base_dn", "auth_ldap"),
      },
      oidc: {
        oidcUrl: getStr(oidcConfig, "url", "auth_oidc"),
        oidcClientId: getStr(oidcConfig, "clientid", "auth_oidc"),
        oidcSecret: getStr(oidcConfig, "secret", "auth_oidc"),
        oidcCallback: getStr(oidcConfig, "callback", "auth_oidc"),
        oidcGroupMappings: getStr(oidcConfig, "group_mappings", "auth_oidc"),
      },
    },
  };
}

export async function saveAuthConfig(body: Record<string, any>) {
  await setValue("auth", "enable_local", body.authLocal);
  await setValue("auth", "enable_ldap", body.authLdap);
  await setValue("auth", "enable_oidc", body.authOidc);

  await setValue("auth_local", "password_length", body.passwordLength);
  await setValue("auth_local", "upper_count", body.upperCount);
  await setValue("auth_local", "lower_count", body.lowerCount);
  await setValue("auth_local", "number_count", body.numberCount);
  await setValue("auth_local", "special_count", body.specialCount);

  await setValue("auth_ldap", "url", body.ldapUrl);
  await setValue("auth_ldap", "bind_dn", body.ldapBindDn);
  await setValue("auth_ldap", "password", body.ldapPassword);
  await setValue("auth_ldap", "base_dn", body.ldapBaseDn);

  await setValue("auth_oidc", "url", body.oidcUrl);
  await setValue("auth_oidc", "clientid", body.oidcClientId);
  await setValue("auth_oidc", "secret", body.oidcSecret);
  await setValue("auth_oidc", "callback", body.oidcCallback);
  await setValue("auth_oidc", "group_mappings", body.oidcGroupMappings);
}
