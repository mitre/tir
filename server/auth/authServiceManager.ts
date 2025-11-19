import type { H3Event } from "h3";
import { AuthProvider } from "./authProvider";
import { authProviderRegistry } from "./authProviderRegistry";
import { type AuthConfig, type Provider, PROVIDERS } from "~/types/auth";
import { getConfigValue } from "~/server/utils/config/tirConfig";

export class AuthService {
  private providers: Partial<Record<Provider, AuthProvider>> = {};
  private config: AuthConfig;

  private constructor(cfg: AuthConfig) {
    this.config = cfg;
  }

  static async initWith(cfg: AuthConfig): Promise<AuthService> {
    const svc = new AuthService(cfg);
    await svc.reload(cfg);
    return svc;
  }

  private computeProvidersToLoad(cfg: AuthConfig): Provider[] {
    const enabled = PROVIDERS.filter((p) => cfg[p]?.enable);
    if (enabled.length === 0) {
      logger.alert({
        service: "auth",
        message: "No authentication providers enabled. Falling back to Local auth.",
      });
      return ["local"];
    }
    return enabled;
  }

  async reload(cfg: AuthConfig) {
    this.providers = {};
    this.config = cfg;

    const toLoad = this.computeProvidersToLoad(this.config);

    for (const p of toLoad) {
      const factory = authProviderRegistry[p];
      if (!factory) continue;

      const providerCfg = Object.fromEntries(
        Object.entries(this.config[p] ?? {}).filter(([k]) => k !== "enable"),
      );
      if (p === "oidc") {
        const secret = await getConfigValue("auth", "oidcSecret");
        if (secret) providerCfg.secret = secret;
      }

      if (p === "ldap") {
        const password = await getConfigValue("aauth", "ldapPassword");
        if (password) providerCfg.password = password;
      }

      this.providers[p] = await factory(providerCfg);
    }

    logger.info({
      service: "auth",
      message: `Reloaded auth providers: ${toLoad.join(", ")}`,
    });
  }

  getProvider(provider: Provider): AuthProvider {
    const authProvider = this.providers[provider];
    if (!authProvider) {
      throw new Error(`Auth provider '${provider}' not found or not active`);
    }
    return authProvider;
  }

  async authenticate(provider: Provider, event: H3Event, credentials: any) {
    logger.debug({ service: "auth", message: `Authenticating using provider: ${provider}` });
    const authProvider = this.getProvider(provider);
    return await authProvider.authenticate(event, credentials);
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

export function getActiveProvidersView(cfg: AuthConfig): Provider[] {
  const enabled = PROVIDERS.filter((p) => cfg[p]?.enable);
  return enabled.length ? enabled : (["local"] as Provider[]);
}
