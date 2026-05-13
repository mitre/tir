import {
  getRawConfigValue,
  setRawConfigValue,
  deleteRawConfigValue,
} from "~/server/utils/config/tirConfig";
import {
  type AuthConfig,
  type LocalAuthConfig,
  type LDAPProviderConfig,
  type OIDCProviderConfig,
  type OAuthProviderConfig,
  LOCAL_SCHEMA,
  LDAP_PROVIDER_SCHEMA,
  OIDC_PROVIDER_SCHEMA,
  OAUTH_PROVIDER_SCHEMA,
} from "~/types/auth";

// --- Key conventions ---
// auth:local:<field>
// auth:oidc:index  +  auth:oidc:<id>:<field>
// auth:ldap:index  +  auth:ldap:<id>:<field>
// auth:oauth:index +  auth:oauth:<id>:<field>
// auth:defaultLoginProvider

const OIDC_INDEX_KEY  = "auth:oidc:index";
const LDAP_INDEX_KEY  = "auth:ldap:index";
const OAUTH_INDEX_KEY = "auth:oauth:index";

const localKey  = (field: string) => `auth:local:${field}`;
const oidcKey   = (id: string, field: string) => `auth:oidc:${id}:${field}`;
const ldapKey   = (id: string, field: string) => `auth:ldap:${id}:${field}`;
const oauthKey  = (id: string, field: string) => `auth:oauth:${id}:${field}`;

async function getIndex(indexKey: string): Promise<string[]> {
  const raw = await getRawConfigValue(indexKey);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function setIndex(indexKey: string, ids: string[]): Promise<void> {
  await setRawConfigValue(indexKey, JSON.stringify(ids));
}

function coerce(raw: string | undefined, type: string, dflt: any): any {
  if (raw === undefined) return dflt;
  switch (type) {
    case "bool": return raw === "true" || raw === "1";
    case "num":  { const n = Number(raw); return Number.isFinite(n) ? n : dflt; }
    default:     return raw;
  }
}

async function loadLocalConfig(): Promise<LocalAuthConfig> {
  const out: any = {};
  for (const [field, spec] of Object.entries(LOCAL_SCHEMA)) {
    const raw = await getRawConfigValue(localKey(field));
    out[field] = coerce(raw, spec.type, spec.default);
  }
  return out as LocalAuthConfig;
}

async function saveLocalConfig(input: LocalAuthConfig): Promise<void> {
  await Promise.all(
    Object.entries(input).map(([field, value]) =>
      value !== undefined ? setRawConfigValue(localKey(field), value) : Promise.resolve(),
    ),
  );
}

async function loadProvider<T>(
  keyFn: (f: string) => string,
  schema: Record<string, any>,
  id: string,
): Promise<T> {
  const out: any = { id };
  for (const [field, spec] of Object.entries(schema)) {
    const raw = await getRawConfigValue(keyFn(field));
    if (spec.omit) {
      const flag = spec.setFlag ?? `${field}Set`;
      out[flag] = raw !== undefined && raw !== "" && raw !== "null";
    } else {
      out[field] = coerce(raw, spec.type, spec.default);
    }
  }
  return out as T;
}

const loadOIDCProvider  = (id: string) => loadProvider<OIDCProviderConfig>((f) => oidcKey(id, f),  OIDC_PROVIDER_SCHEMA,  id);
const loadLDAPProvider  = (id: string) => loadProvider<LDAPProviderConfig>((f) => ldapKey(id, f),  LDAP_PROVIDER_SCHEMA,  id);
const loadOAuthProvider = (id: string) => loadProvider<OAuthProviderConfig>((f) => oauthKey(id, f), OAUTH_PROVIDER_SCHEMA, id);

async function saveProvider(
  keyFn: (f: string) => string,
  schema: Record<string, any>,
  data: Record<string, any>,
): Promise<void> {
  const ops: Promise<void>[] = [];
  for (const [field, spec] of Object.entries(schema)) {
    const value = data[field];
    if (spec.omit && !value) continue;
    if (!spec.omit && value === undefined) continue;
    ops.push(setRawConfigValue(keyFn(field), value));
  }
  await Promise.all(ops);
}

async function deleteProvider(keyFn: (f: string) => string, schema: Record<string, any>): Promise<void> {
  await Promise.all(Object.keys(schema).map((f) => deleteRawConfigValue(keyFn(f))));
}

export async function loadAuthConfig(): Promise<AuthConfig> {
  const [local, ldapIds, oidcIds, oauthIds, defaultLoginProvider] = await Promise.all([
    loadLocalConfig(),
    getIndex(LDAP_INDEX_KEY),
    getIndex(OIDC_INDEX_KEY),
    getIndex(OAUTH_INDEX_KEY),
    getRawConfigValue("auth:defaultLoginProvider"),
  ]);

  const [ldap, oidc, oauth] = await Promise.all([
    Promise.all(ldapIds.map(loadLDAPProvider)),
    Promise.all(oidcIds.map(loadOIDCProvider)),
    Promise.all(oauthIds.map(loadOAuthProvider)),
  ]);

  return { local, ldap: ldap ?? [], oidc: oidc ?? [], oauth: oauth ?? [], defaultLoginProvider: defaultLoginProvider ?? "local" };
}

export async function saveAuthConfig(input: Partial<AuthConfig>): Promise<void> {
  if (input.local) {
    await saveLocalConfig(input.local);
  }

  if (input.defaultLoginProvider !== undefined) {
    await setRawConfigValue("auth:defaultLoginProvider", input.defaultLoginProvider);
  }

  if (input.ldap !== undefined) {
    const storedIds = await getIndex(LDAP_INDEX_KEY);
    const submittedIds = input.ldap.map((p) => p.id);
    await Promise.all([
      ...storedIds.filter((id) => !submittedIds.includes(id))
        .map((id) => deleteProvider((f) => ldapKey(id, f), LDAP_PROVIDER_SCHEMA)),
      ...(input.ldap as (LDAPProviderConfig & { password?: string })[])
        .map((p) => saveProvider((f) => ldapKey(p.id, f), LDAP_PROVIDER_SCHEMA, p as any)),
    ]);
    await setIndex(LDAP_INDEX_KEY, submittedIds);
  }

  if (input.oidc !== undefined) {
    const storedIds = await getIndex(OIDC_INDEX_KEY);
    const submittedIds = input.oidc.map((p) => p.id);
    await Promise.all([
      ...storedIds.filter((id) => !submittedIds.includes(id))
        .map((id) => deleteProvider((f) => oidcKey(id, f), OIDC_PROVIDER_SCHEMA)),
      ...(input.oidc as (OIDCProviderConfig & { secret?: string })[])
        .map((p) => saveProvider((f) => oidcKey(p.id, f), OIDC_PROVIDER_SCHEMA, p as any)),
    ]);
    await setIndex(OIDC_INDEX_KEY, submittedIds);
  }

  if (input.oauth !== undefined) {
    const storedIds = await getIndex(OAUTH_INDEX_KEY);
    const submittedIds = input.oauth.map((p) => p.id);
    await Promise.all([
      ...storedIds.filter((id) => !submittedIds.includes(id))
        .map((id) => deleteProvider((f) => oauthKey(id, f), OAUTH_PROVIDER_SCHEMA)),
      ...(input.oauth as (OAuthProviderConfig & { secret?: string })[])
        .map((p) => saveProvider((f) => oauthKey(p.id, f), OAUTH_PROVIDER_SCHEMA, p as any)),
    ]);
    await setIndex(OAUTH_INDEX_KEY, submittedIds);
  }
}
