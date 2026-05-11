import type { H3Event } from "h3";

export type AuthEvent = H3Event;

export interface LocalAuthConfig {
  enable: boolean;
  passwordLength: number;
  upperCount: number;
  lowerCount: number;
  numberCount: number;
  specialCount: number;
}

export const LOCAL_SCHEMA = {
  enable: { type: "bool", default: true },
  passwordLength: { type: "num", default: 8 },
  upperCount: { type: "num", default: 0 },
  lowerCount: { type: "num", default: 0 },
  numberCount: { type: "num", default: 0 },
  specialCount: { type: "num", default: 0 },
} as const;

export type LDAPTemplate = "openldap" | "msad";

export interface LDAPProviderConfig {
  id: string;
  label: string;
  template: LDAPTemplate;
  enable: boolean;
  url: string;
  bindDn: string;
  passwordSet: boolean;
  baseDn: string;
  ssl: boolean;
  sslInsecure: boolean;
  sslCa: string;
}

export const LDAP_PROVIDER_SCHEMA = {
  label: { type: "str", default: "LDAP" },
  template: { type: "str", default: "openldap" },
  enable: { type: "bool", default: false },
  url: { type: "str", default: "" },
  bindDn: { type: "str", default: "" },
  password: { type: "str", default: "", omit: true, setFlag: "passwordSet" },
  baseDn: { type: "str", default: "" },
  ssl: { type: "bool", default: false },
  sslInsecure: { type: "bool", default: false },
  sslCa: { type: "str", default: "" },
} as const;

export type OIDCGroupClaimType = "scope" | "claim";

export interface OIDCProviderConfig {
  id: string;
  label: string;
  enable: boolean;
  url: string;
  clientId: string;
  secretSet: boolean;
  callback: string;
  groupMappings: string;
  groupClaimType: OIDCGroupClaimType;
  groupClaimPath: string;
}

export const OIDC_PROVIDER_SCHEMA = {
  label: { type: "str", default: "OIDC" },
  enable: { type: "bool", default: false },
  url: { type: "str", default: "" },
  clientId: { type: "str", default: "" },
  secret: { type: "str", default: "", omit: true, setFlag: "secretSet" },
  callback: { type: "str", default: "" },
  groupMappings: { type: "str", default: "" },
  groupClaimType: { type: "str", default: "scope" },
  groupClaimPath: { type: "str", default: "" },
} as const;

export type OAuthProviderType = "github" | "gitlab" | "bitbucket" | "custom";

export interface OAuthProviderConfig {
  id: string;
  label: string;
  providerType: OAuthProviderType;
  enable: boolean;
  baseUrl: string;
  clientId: string;
  secretSet: boolean;
  callback: string;
  groupMappings: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  groupClaimPath: string;
}

export const OAUTH_PROVIDER_SCHEMA = {
  label: { type: "str", default: "OAuth 2.0" },
  providerType: { type: "str", default: "github" },
  enable: { type: "bool", default: false },
  baseUrl: { type: "str", default: "" },
  clientId: { type: "str", default: "" },
  secret: { type: "str", default: "", omit: true, setFlag: "secretSet" },
  callback: { type: "str", default: "" },
  groupMappings: { type: "str", default: "" },
  authorizationUrl: { type: "str", default: "" },
  tokenUrl: { type: "str", default: "" },
  userInfoUrl: { type: "str", default: "" },
  groupClaimPath: { type: "str", default: "" },
} as const;

export type AuthConfig = {
  local: LocalAuthConfig;
  ldap: LDAPProviderConfig[];
  oidc: OIDCProviderConfig[];
  oauth: OAuthProviderConfig[];
  defaultLoginProvider: string;
};
