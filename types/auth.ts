import type { H3Event } from "h3";

export const PROVIDERS = ["local", "ldap", "oidc"] as const;
export type Provider = (typeof PROVIDERS)[number];

export type AuthEvent = H3Event;

export type AuthConfig = {
  local: {
    enable: boolean;
    passwordLength: number;
    upperCount: number;
    lowerCount: number;
    numberCount: number;
    specialCount: number;
  };
  ldap: {
    enable: boolean;
    url: string;
    bindDn: string;
    passwordSet: boolean;
    baseDn: string;
  };
  oidc: {
    enable: boolean;
    url: string;
    clientId: string;
    secretSet: boolean;
    callback: string;
    groupMappings: string;
  };
};

export const LOCAL_SCHEMA = {
  enable: { type: "bool", default: false },
  passwordLength: { type: "num", default: 8 },
  upperCount: { type: "num", default: 0 },
  lowerCount: { type: "num", default: 0 },
  numberCount: { type: "num", default: 0 },
  specialCount: { type: "num", default: 0 },
} as const;

export const LDAP_SCHEMA = {
  enable: { type: "bool", default: false },
  url: { type: "str", default: "" },
  bindDn: { type: "str", default: "" },
  password: { type: "str", default: "", omit: true, setFlag: "passwordSet" },
  baseDn: { type: "str", default: "" },
} as const;

export const OIDC_SCHEMA = {
  enable: { type: "bool", default: false },
  url: { type: "str", default: "" },
  clientId: { type: "str", default: "" },
  secret: { type: "str", default: "", omit: true, setFlag: "secretSet" },
  callback: { type: "str", default: "" },
  groupMappings: { type: "str", default: "" },
} as const;
