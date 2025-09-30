import { LocalAuthProvider } from "./localAuthProvider";
import { LDAPAuthProvider } from "./ldapAuthProvider";
import { OIDCAuthProvider } from "./oidcAuthProvider";
import type { AuthProvider } from "./authProvider";

export const authProviderRegistry: Record<string, (config: any) => Promise<AuthProvider>> = {
  local: async (config) => {
    const provider = new LocalAuthProvider(config);
    await provider.init();
    return provider;
  },
  ldap: async (config) => {
    const provider = new LDAPAuthProvider(config);
    await provider.init();
    return provider;
  },
  oidc: async (config) => {
    const provider = new OIDCAuthProvider(config);
    await provider.init();
    return provider;
  },
};
