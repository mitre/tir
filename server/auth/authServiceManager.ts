import { AuthProvider } from "./authProvider";
import { authProviderRegistry } from "./authProviderRegistry";

export type AuthProviderType = "local" | "ldap" | "oidc";

export type AuthSettings = {
  enabledProviders: AuthProviderType[];
  config: {
    local: {
      passwordLength: number;
      upperCount: number;
      lowerCount: number;
      numberCount: number;
      specialCount: number;
    };
    ldap: {
      ldapUrl?: string;
      ldapBindDn?: string;
      ldapPassword?: string;
      ldapBaseDn?: string;
    };
    oidc: {
      oidcUrl?: string;
      oidcClientId?: string;
      oidcSecret?: string;
      oidcCallback?: string;
      oidcGroupMappings?: string;
    };
  };
};

export class AuthService {
  private providers: { [key: string]: AuthProvider } = {};
  private settings: AuthSettings = { enabledProviders: [], config: {} };

  private constructor() {}

  static async initWith(settings: AuthSettings): Promise<AuthService> {
    const service = new AuthService();

    if (!settings.enabledProviders || settings.enabledProviders.length === 0) {
      logger.alert({
        service: "auth",
        message: "No authentication providers configured. Falling back to 'local' provider.",
      });

      settings.enabledProviders = ["local"];
      settings.config.local = {
        passwordLength: 8,
        upperCount: 0,
        lowerCount: 0,
        numberCount: 0,
        specialCount: 0,
      };
    }

    await service.reload(settings);
    return service;
  }

  async reload(settings: AuthSettings) {
    this.providers = {};
    this.settings = settings;

    for (const type of settings.enabledProviders) {
      const factory = authProviderRegistry[type];
      if (!factory) continue;
      this.providers[type] = await factory(settings.config[type] || {});
    }

    logger.info({
      service: "auth",
      message: `Reloaded auth providers: ${settings.enabledProviders.join(", ")}`,
    });
  }

  getProvider(provider: string): AuthProvider {
    const authProvider = this.providers[provider];
    if (!authProvider) throw new Error(`Auth provider '${provider}' not found`);
    return authProvider;
  }

  async authenticate(provider: string, event: H3Event, credentials: any) {
    logger.debug({ service: "auth", message: `Authenticating using provider: ${provider}` });
    const authProvider = this.getProvider(provider);
    return await authProvider.authenticate(event, credentials);
  }
}

let authServiceManager: AuthService;

export async function initializeAuthService(config: AuthSettings) {
  authServiceManager = await AuthService.initWith(config);
}

export function getAuthServiceManager(): AuthService {
  if (!authServiceManager) throw new Error("authServiceManager has not been initialized yet.");
  return authServiceManager;
}
