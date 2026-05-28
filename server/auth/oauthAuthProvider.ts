import { H3Event, H3Error } from "h3";
import { AuthProvider } from "./authProvider";
import type { TestLoginResult } from "./authProvider";
import type { OAuthProviderConfig, OAuthProviderType } from "~/types/auth";

interface GroupMapping {
  identifier: string;
  userRoleId: number;
}

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
}

export const KNOWN_PROVIDERS: Record<
  Exclude<OAuthProviderType, "custom">,
  {
    authorize: (base: string) => string;
    token: (base: string) => string;
    apiBase: (base: string) => string;
    health: (base: string) => string;
    scope: string;
  }
> = {
  github: {
    authorize: () => "https://github.com/login/oauth/authorize",
    token: () => "https://github.com/login/oauth/access_token",
    apiBase: () => "https://api.github.com",
    health: () => "https://api.github.com",
    scope: "read:user user:email read:org",
  },
  gitlab: {
    authorize: (base) => `${base || "https://gitlab.com"}/oauth/authorize`,
    token: (base) => `${base || "https://gitlab.com"}/oauth/token`,
    apiBase: (base) => `${base || "https://gitlab.com"}/api/v4`,
    health: (base) => `${base || "https://gitlab.com"}/api/v4/version`,
    scope: "read_user api",
  },
  bitbucket: {
    authorize: () => "https://bitbucket.org/site/oauth2/authorize",
    token: () => "https://bitbucket.org/site/oauth2/access_token",
    apiBase: () => "https://api.bitbucket.org/2.0",
    health: () => "https://api.bitbucket.org/2.0/",
    scope: "account email",
  },
};

export class OAuthAuthProvider extends AuthProvider {
  private config: OAuthProviderConfig & { secret?: string };
  private groupMappings: GroupMapping[] = [];

  constructor(config: OAuthProviderConfig & { secret?: string }) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {
    this.groupMappings = parseGroupMappings(this.config.groupMappings);
    logger.debug({
      service: "auth",
      message: `OAuth '${this.config.label}' (${this.config.id}, ${this.config.providerType}) initialized with ${this.groupMappings.length} group mappings`,
    });
  }

  async authenticate(event: H3Event, _credentials: any) {
    const { providerType, baseUrl, clientId, callback } = this.config;

    let authorizeUrl: string;
    let scope: string;

    if (providerType === "custom") {
      if (!this.config.authorizationUrl) throw new H3Error("Custom OAuth: authorizationUrl is required.");
      authorizeUrl = this.config.authorizationUrl;
      scope = "openid profile email";
    } else {
      const p = KNOWN_PROVIDERS[providerType];
      authorizeUrl = p.authorize(baseUrl);
      scope = p.scope;
    }

    const randomState = generateRandomState();
    const state = `oauth:${this.config.id}~${randomState}`;

    const params = new URLSearchParams({ client_id: clientId, redirect_uri: callback, scope, state });
    event.context.auth = { state };
    return { redirect: `${authorizeUrl}?${params}` };
  }

  private async resolveFromCode(event: H3Event) {
    const { state } = event.context.auth || {};
    if (!state) throw new Error("Missing state in OAuth callback.");

    const url = new URL(
      `${event.node.req.headers["x-forwarded-proto"] || "http"}://${event.node.req.headers.host}${event.node.req.url}`,
    );
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");

    if (!code) throw new Error("No authorization code in OAuth callback.");
    if (returnedState !== state) throw new Error("State mismatch in OAuth callback.");

    const { providerType } = this.config;
    let profile: UserProfile;
    let userGroups: string[];

    if (providerType === "github") {
      const token = await this.exchangeToken(code, "json");
      profile = await this.fetchGitHubProfile(token);
      userGroups = await this.fetchGitHubGroups(token, profile.email);
    } else if (providerType === "gitlab") {
      const token = await this.exchangeToken(code, "json");
      profile = await this.fetchGitLabProfile(token);
      userGroups = await this.fetchGitLabGroups(token, profile.email);
    } else if (providerType === "bitbucket") {
      const token = await this.exchangeToken(code, "basic-auth-form");
      profile = await this.fetchBitbucketProfile(token);
      userGroups = await this.fetchBitbucketGroups(token, profile.email);
    } else {
      const token = await this.exchangeToken(code, "json");
      const userInfo = await this.fetchUserInfo(this.config.userInfoUrl, token);
      profile = extractCustomProfile(userInfo);
      userGroups = extractClaimGroups(userInfo, this.config.groupClaimPath);
    }

    return { profile, userGroups };
  }

  async handleCallback(event: H3Event) {
    const { profile, userGroups } = await this.resolveFromCode(event);
    const userRoleId = resolveRole(userGroups, this.groupMappings, this.config.groupMappings);
    return this.finalizeLogin(event, profile, "oauth", userRoleId);
  }

  async handleTestCallback(event: H3Event): Promise<TestLoginResult> {
    const { profile, userGroups } = await this.resolveFromCode(event);
    const userRoleId = resolveRoleQuiet(userGroups, this.groupMappings);
    const denied = this.config.groupMappings.length > 0 && userRoleId === null;
    return {
      providerId: this.config.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      groups: userGroups,
      userRoleId,
      denied,
    };
  }

  private async exchangeToken(
    code: string,
    method: "json" | "basic-auth-form",
  ): Promise<string> {
    const { clientId, secret, callback } = this.config;
    const providerType = this.config.providerType;

    let tokenUrl: string;
    if (providerType === "custom") {
      if (!this.config.tokenUrl) throw new H3Error("Custom OAuth: tokenUrl is required.");
      tokenUrl = this.config.tokenUrl;
    } else {
      tokenUrl = KNOWN_PROVIDERS[providerType as Exclude<OAuthProviderType, "custom">].token(
        this.config.baseUrl,
      );
    }

    let res: Response;

    if (method === "basic-auth-form") {
      const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");
      const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: callback });
      res = await fetch(tokenUrl, {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } else {
      res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: secret, code, grant_type: "authorization_code", redirect_uri: callback }),
      });
    }

    if (!res.ok) throw new Error(`OAuth token exchange failed: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`OAuth token error: ${data.error_description || data.error}`);
    if (!data.access_token) throw new Error("No access_token in OAuth response.");
    return data.access_token;
  }

  private async fetchGitHubProfile(token: string): Promise<UserProfile> {
    const api = KNOWN_PROVIDERS.github.apiBase("");
    const headers = githubHeaders(token);
    const res = await fetch(`${api}/user`, { headers });
    if (!res.ok) throw new Error("Failed to fetch GitHub user info.");
    const u = await res.json();

    let email: string = u.email;
    if (!email) {
      const emailRes = await fetch(`${api}/user/emails`, { headers });
      if (emailRes.ok) {
        const emails: any[] = await emailRes.json();
        email = emails.find((e) => e.primary && e.verified)?.email;
      }
    }
    if (!email) throw new Error("Could not determine a verified email from GitHub.");
    return { email, ...splitName(u.name || u.login) };
  }

  private async fetchGitHubGroups(token: string, email: string): Promise<string[]> {
    if (this.groupMappings.length === 0) return [];
    const api = KNOWN_PROVIDERS.github.apiBase("");
    const res = await fetch(`${api}/user/teams?per_page=100`, { headers: githubHeaders(token) });
    if (!res.ok) {
      logger.warn({ service: "auth", message: `Could not fetch GitHub teams for ${email}: ${res.status}` });
      throw new H3Error("Unauthorized: Could not verify GitHub team membership.");
    }
    const teams: any[] = await res.json();
    const groups = teams.map((t) => `${t.organization?.login?.toLowerCase()}/${t.slug?.toLowerCase()}`);
    logger.debug({
      service: "auth",
      message: `GitHub teams for ${email}: [${groups.join(", ") || "none"}]`,
    });
    return groups;
  }

  private async fetchGitLabProfile(token: string): Promise<UserProfile> {
    const api = KNOWN_PROVIDERS.gitlab.apiBase(this.config.baseUrl);
    const res = await fetch(`${api}/user`, { headers: bearerHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch GitLab user info.");
    const u = await res.json();
    if (!u.email) throw new Error("GitLab user has no email address.");
    return { email: u.email, ...splitName(u.name || u.username) };
  }

  private async fetchGitLabGroups(token: string, email: string): Promise<string[]> {
    if (this.groupMappings.length === 0) return [];
    const api = KNOWN_PROVIDERS.gitlab.apiBase(this.config.baseUrl);
    const res = await fetch(`${api}/groups?min_access_level=10&per_page=100`, {
      headers: bearerHeaders(token),
    });
    if (!res.ok) {
      logger.warn({ service: "auth", message: `Could not fetch GitLab groups for ${email}: ${res.status}` });
      throw new H3Error("Unauthorized: Could not verify GitLab group membership.");
    }
    const groups: any[] = await res.json();
    return groups.map((g) => g.full_path?.toLowerCase());
  }

  private async fetchBitbucketProfile(token: string): Promise<UserProfile> {
    const api = KNOWN_PROVIDERS.bitbucket.apiBase("");
    const headers = bearerHeaders(token);
    const res = await fetch(`${api}/user`, { headers });
    if (!res.ok) throw new Error("Failed to fetch Bitbucket user info.");
    const u = await res.json();

    const emailRes = await fetch(`${api}/user/emails`, { headers });
    if (!emailRes.ok) throw new Error("Failed to fetch Bitbucket user emails.");
    const emailData = await emailRes.json();
    const primary = emailData.values?.find((e: any) => e.is_primary && e.is_confirmed);
    if (!primary?.email) throw new Error("Could not determine a verified email from Bitbucket.");
    return { email: primary.email, ...splitName(u.display_name || u.username) };
  }

  private async fetchBitbucketGroups(token: string, email: string): Promise<string[]> {
    if (this.groupMappings.length === 0) return [];
    const api = KNOWN_PROVIDERS.bitbucket.apiBase("");
    const res = await fetch(`${api}/user/permissions/workspaces?pagelen=100`, {
      headers: bearerHeaders(token),
    });
    if (!res.ok) {
      logger.warn({ service: "auth", message: `Could not fetch Bitbucket workspaces for ${email}: ${res.status}` });
      throw new H3Error("Unauthorized: Could not verify Bitbucket workspace membership.");
    }
    const data = await res.json();
    return (data.values || []).map((v: any) => v.workspace?.slug?.toLowerCase());
  }

  private async fetchUserInfo(userInfoUrl: string, token: string): Promise<any> {
    if (!userInfoUrl) throw new H3Error("Custom OAuth: userInfoUrl is required.");
    const res = await fetch(userInfoUrl, { headers: bearerHeaders(token) });
    if (!res.ok) throw new Error(`Failed to fetch user info from ${userInfoUrl}: ${res.status}`);
    return res.json();
  }

}

function parseGroupMappings(raw: string): GroupMapping[] {
  return raw
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const lastColon = entry.lastIndexOf(":");
      return {
        identifier: entry.slice(0, lastColon).trim().toLowerCase(),
        userRoleId: parseInt(entry.slice(lastColon + 1).trim(), 10),
      };
    });
}

function resolveRole(
  userGroups: string[],
  mappings: GroupMapping[],
  rawMappings: string,
): number | null {
  if (mappings.length === 0) return null;

  logger.debug({
    service: "auth",
    message: `OAuth role resolution -- user groups: [${userGroups.join(", ") || "none"}], mappings: [${mappings.map((m) => `${m.identifier}->${m.userRoleId}`).join(", ")}]`,
  });

  let userRoleId: number | null = null;
  for (const group of userGroups) {
    for (const mapping of mappings) {
      if (group === mapping.identifier) {
        // Least-privilege: User (2) takes precedence over Admin (1) when multiple match
        if (userRoleId === null || (userRoleId !== 2 && mapping.userRoleId === 2)) {
          userRoleId = mapping.userRoleId;
        }
      }
    }
  }

  if (rawMappings && !userRoleId) {
    throw new H3Error("Unauthorized: You do not belong to any permitted groups.");
  }
  return userRoleId;
}

function resolveRoleQuiet(userGroups: string[], mappings: GroupMapping[]): number | null {
  if (mappings.length === 0) return null;
  let userRoleId: number | null = null;
  for (const group of userGroups) {
    for (const mapping of mappings) {
      if (group === mapping.identifier) {
        if (userRoleId === null || (userRoleId !== 2 && mapping.userRoleId === 2)) {
          userRoleId = mapping.userRoleId;
        }
      }
    }
  }
  return userRoleId;
}

function extractCustomProfile(userInfo: any): UserProfile {
  const email = userInfo.email;
  if (!email) throw new Error("Custom OAuth user info does not contain an email field.");
  const firstName =
    userInfo.given_name || userInfo.first_name || (userInfo.name || "").split(" ")[0] || "Unknown";
  const lastName =
    userInfo.family_name ||
    userInfo.last_name ||
    (userInfo.name || "").split(" ").slice(1).join(" ") ||
    "Unknown";
  return { email, firstName, lastName };
}

function extractClaimGroups(userInfo: any, claimPath: string): string[] {
  if (!claimPath) return [];
  const value = claimPath.split(".").reduce((cur: any, key) => cur?.[key], userInfo);
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string").map((v) => v.replace(/^\//, "").toLowerCase());
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || "").split(" ");
  return { firstName: parts[0] || "Unknown", lastName: parts.slice(1).join(" ") || "Unknown" };
}

function bearerHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": "TIR-Auth" };
}

function githubHeaders(token: string) {
  return { ...bearerHeaders(token), "X-GitHub-Api-Version": "2022-11-28" };
}

function generateRandomState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
