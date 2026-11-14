import { LocalAuthProvider } from "./localAuthProvider";
import { LDAPAuthProvider } from "./ldapAuthProvider";
import { OIDCAuthProvider } from "./oidcAuthProvider";
import { OAuthAuthProvider } from "./oauthAuthProvider";
import type { AuthProvider } from "./authProvider";
import type { LDAPProviderConfig, OIDCProviderConfig, OAuthProviderConfig } from "~/types/auth";

export const authProviderRegistry = {
  local: async (config: any): Promise<AuthProvider> => {
    const provider = new LocalAuthProvider(config);
    await provider.init();
    return provider;
  },
  ldap: async (config: LDAPProviderConfig & { password?: string }): Promise<AuthProvider> => {
    const provider = new LDAPAuthProvider(config);
    await provider.init();
    return provider;
  },
  oidc: async (config: OIDCProviderConfig & { secret?: string }): Promise<AuthProvider> => {
    const provider = new OIDCAuthProvider(config);
    await provider.init();
    return provider;
  },
  oauth: async (config: OAuthProviderConfig & { secret?: string }): Promise<AuthProvider> => {
    const provider = new OAuthAuthProvider(config);
    await provider.init();
    return provider;
  },
};
