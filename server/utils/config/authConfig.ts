import { setConfigValue, loadBySchema } from "~/server/utils/config/tirConfig";
import {
  type AuthConfig,
  type Provider,
  PROVIDERS,
  LOCAL_SCHEMA,
  LDAP_SCHEMA,
  OIDC_SCHEMA,
} from "~/types/auth";
import type { Schema } from "~/server/utils/config/tirConfig";

const SCHEMAS: Record<Provider, Schema> = {
  local: LOCAL_SCHEMA,
  ldap: LDAP_SCHEMA,
  oidc: OIDC_SCHEMA,
};

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const baseKeyFor = (provider: Provider, field: string) => provider + capitalize(field);

export async function loadAuthConfig(): Promise<AuthConfig> {
  const [local, ldap, oidc] = await Promise.all([
    loadBySchema("auth", "local", LOCAL_SCHEMA),
    loadBySchema("auth", "ldap", LDAP_SCHEMA),
    loadBySchema("auth", "oidc", OIDC_SCHEMA),
  ]);
  return { local, ldap, oidc };
}

export async function saveAuthConfig(input: Partial<AuthConfig>): Promise<void> {
  const ops: Promise<any>[] = [];

  for (const provider of PROVIDERS) {
    const data = (input as any)[provider] as Record<string, unknown> | undefined;
    if (!data) continue;

    const schema = SCHEMAS[provider];
    if (!schema) continue;

    for (const [field, spec] of Object.entries(schema)) {
      if (!Object.prototype.hasOwnProperty.call(data, field)) continue;

      const value = (data as any)[field];

      if (spec.omit) {
        if (value === undefined || value === "" || value === null) continue;
        ops.push(setConfigValue("auth", baseKeyFor(provider, field), value));
      } else {
        if (value === undefined) continue;
        ops.push(setConfigValue("auth", baseKeyFor(provider, field), value));
      }
    }
  }

  await Promise.all(ops);
}
