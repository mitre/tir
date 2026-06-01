import type { H3Event } from "h3";
import { AuthProvider } from "./authProvider";
import { authProviderRegistry } from "./authProviderRegistry";
import { type AuthConfig } from "~/types/auth";
import { getRawConfigValue } from "~/server/utils/config/tirConfig";

export class AuthService {
  private readonly providers: Map<string, AuthProvider> = new Map();
  private config: AuthConfig;

  private constructor(cfg: AuthConfig) {
    this.config = cfg;
  }

  static async initWith(cfg: AuthConfig): Promise<AuthService> {
    const svc = new AuthService(cfg);
    await svc.reload(cfg);
    return svc;
  }

  async reload(cfg: AuthConfig) {
    this.providers.clear();
    this.config = cfg;

    const anyOtherEnabled =
      cfg.ldap.some((p) => p.enable) || cfg.oidc.some((p) => p.enable) || cfg.oauth.some((p) => p.enable);

    if (cfg.local.enable || !anyOtherEnabled) {
      if (!cfg.local.enable && !anyOtherEnabled) {
        logger.alert({
          service: "auth",
          message: "No auth providers enabled. Falling back to local auth.",
        });
      }
      this.providers.set("local", await authProviderRegistry.local(cfg.local));
    }

    for (const ldapCfg of cfg.ldap) {
      if (!ldapCfg.enable) continue;
      const password = await getRawConfigValue(`auth:ldap:${ldapCfg.id}:password`);
      const fullCfg = { ...ldapCfg, ...(password ? { password } : {}) };
      this.providers.set(`ldap:${ldapCfg.id}`, await authProviderRegistry.ldap(fullCfg));
    }

    for (const oidcCfg of cfg.oidc) {
      if (!oidcCfg.enable) continue;
      const secret = await getRawConfigValue(`auth:oidc:${oidcCfg.id}:secret`);
      const fullCfg = { ...oidcCfg, ...(secret ? { secret } : {}) };
      this.providers.set(`oidc:${oidcCfg.id}`, await authProviderRegistry.oidc(fullCfg));
    }

    for (const oauthCfg of cfg.oauth) {
      if (!oauthCfg.enable) continue;
      const secret = await getRawConfigValue(`auth:oauth:${oauthCfg.id}:secret`);
      const fullCfg = { ...oauthCfg, ...(secret ? { secret } : {}) };
      this.providers.set(`oauth:${oauthCfg.id}`, await authProviderRegistry.oauth(fullCfg));
    }

    logger.info({
      service: "auth",
      message: `Auth providers loaded: ${[...this.providers.keys()].join(", ")}`,
    });
  }

  getProvider(key: string): AuthProvider {
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(`Auth provider '${key}' not found or not active`);
    }
    return provider;
  }

  async authenticate(key: string, event: H3Event, credentials: any) {
    logger.debug({ service: "auth", message: `Authenticating with provider: ${key}` });
    return await this.getProvider(key).authenticate(event, credentials);
  }

  getEnabledLDAPIds(): string[] {
    return this.config.ldap.filter((p) => p.enable).map((p) => p.id);
  }

  getEnabledOIDCProviders(): { id: string; label: string }[] {
    return this.config.oidc.filter((p) => p.enable).map((p) => ({ id: p.id, label: p.label }));
  }

  getEnabledOAuthProviders(): { id: string; label: string }[] {
    return this.config.oauth.filter((p) => p.enable).map((p) => ({ id: p.id, label: p.label }));
  }
}

let authServiceManager: AuthService;

export async function initializeAuthService(cfg: AuthConfig) {
  authServiceManager = await AuthService.initWith(cfg);
}

export function getAuthServiceManager(): AuthService {
  if (!authServiceManager) {
    throw new Error("authServiceManager has not been initialized yet.");
  }
  return authServiceManager;
}
