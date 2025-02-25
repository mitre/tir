import { H3Event } from "h3";
import { AuthProvider } from "./authProvider";
import { LocalAuthProvider } from "./localAuthProvider";
import { LDAPAuthProvider } from "./ldapAuthProvider";

export class AuthService {
  private providers: { [key: string]: AuthProvider } = {};

  constructor() {
    this.providers["local"] = new LocalAuthProvider();
    this.providers["ldap"] = new LDAPAuthProvider();
    // TODO: this.providers["sso"] = new SSOAuthProvider();
  }

  getProvider(provider: string): AuthProvider {
    const authProvider = this.providers[provider];
    if (!authProvider) throw new Error(`Auth provider '${provider}' not found`);
    return authProvider;
  }

  async authenticate(provider: string, event: H3Event, credentials: any) {
    const authProvider = this.getProvider(provider);
    return await authProvider.authenticate(event, credentials);
  }
}
