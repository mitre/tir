import type { H3Event } from "h3";

export type AuthEvent = H3Event;

export type AuthConfig = {
  authLocal: boolean;
  authLdap: boolean;
  authOidc: boolean;

  passwordLength: number;
  upperCount: number;
  lowerCount: number;
  numberCount: number;
  specialCount: number;

  ldapUrl: string;
  ldapBindDn: string;
  ldapPasswordSet: boolean;
  ldapBaseDn: string;

  oidcUrl: string;
  oidcClientId: string;
  oidcSecretSet: boolean;
  oidcCallback: string;
  oidcGroupMappings: string;
};
