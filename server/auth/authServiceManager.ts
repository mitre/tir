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
      cfg.ldap.some((p) => p.enable) ||
      cfg.oidc.some((p) => p.enable) ||
      cfg.oauth.some((p) => p.enable);
    const noProvidersEnabled = !cfg.local.enable && !anyOtherEnabled;

    if (noProvidersEnabled) {
      logger.alert({
        service: "auth",
        message: "No auth providers enabled. Falling back to local auth.",
      });
    }
    if (cfg.local.enable || noProvidersEnabled) {
      this.providers.set("local", await authProviderRegistry.local(cfg.local));
    }

    await this.loadProviderGroup("ldap", cfg.ldap, "password", authProviderRegistry.ldap);
    await this.loadProviderGroup("oidc", cfg.oidc, "secret", authProviderRegistry.oidc);
    await this.loadProviderGroup("oauth", cfg.oauth, "secret", authProviderRegistry.oauth);

    logger.info({
      service: "auth",
      message: `Auth providers loaded: ${[...this.providers.keys()].join(", ")}`,
    });
  }

  private async loadProviderGroup<
    C extends { id: string; enable: boolean },
    S extends "password" | "secret",
  >(
    kind: "ldap" | "oidc" | "oauth",
    configs: C[],
    secretField: S,
    build: (cfg: C & Partial<Record<S, string>>) => Promise<AuthProvider>,
  ) {
    for (const cfg of configs) {
      if (!cfg.enable) continue;
      const secret = await getRawConfigValue(`auth:${kind}:${cfg.id}:${secretField}`);
      const fullCfg = { ...cfg, ...(secret ? { [secretField]: secret } : {}) } as C &
        Partial<Record<S, string>>;
      this.providers.set(`${kind}:${cfg.id}`, await build(fullCfg));
    }
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
