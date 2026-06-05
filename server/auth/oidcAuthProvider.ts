import { webcrypto } from "crypto";
import https from "node:https";
import http from "node:http";
import { H3Error } from "h3";
import { AuthProvider } from "./authProvider";
import type { TestLoginResult } from "./authProvider";
import { GroupClaimExtractor } from "./groupClaimExtractor";
import type { AuthEvent, OIDCProviderConfig } from "~/types/auth";

function insecureFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const url = input instanceof Request ? input.url : input.toString();
  const method = (input instanceof Request ? input.method : init?.method ?? "GET").toUpperCase();
  const reqHeaders = Object.fromEntries(new Headers(input instanceof Request ? input.headers : init?.headers));
  let body: string | undefined;
  if (typeof init?.body === "string") body = init.body;
  else if (init?.body instanceof URLSearchParams) body = init.body.toString();

  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib: typeof https = isHttps ? https : (http as any);
  const agent = isHttps ? new https.Agent({ rejectUnauthorized: false }) : undefined;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? "443" : "80"),
        path: (parsed.pathname || "/") + parsed.search,
        method,
        headers: reqHeaders,
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const resHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) v.forEach((s) => resHeaders.append(k, s));
            else if (v) resHeaders.set(k, v);
          }
          resolve(new Response(Buffer.concat(chunks), { status: res.statusCode ?? 200, headers: resHeaders }));
        });
      },
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}


if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown as Crypto;
}

export class OIDCAuthProvider extends AuthProvider {
  private readonly config: OIDCProviderConfig & { secret?: string };
  private extractor!: GroupClaimExtractor;
  private cachedMetadata: any;

  constructor(config: OIDCProviderConfig & { secret?: string }) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {
    const groupRoleMappings = GroupClaimExtractor.parseGroupMappings(this.config.groupMappings);

    this.extractor = new GroupClaimExtractor({
      mode: this.config.groupClaimType,
      claimPath: this.config.groupClaimPath,
      groupRoleMappings,
    });

    logger.debug({
      service: "auth",
      message: `OIDC provider '${this.config.id}' initialized -- mode=${this.config.groupClaimType}, mappings=${groupRoleMappings.length}`,
    });
  }

  private async discover() {
    if (this.cachedMetadata) return this.cachedMetadata;
    const client = await import("openid-client");
    const config = this.config;
    const issuerUrl = new URL(config.url.replace(/\/$/, ""));
    const httpAllowed = issuerUrl.protocol === "http:";

    const options: any = {};
    if (httpAllowed) options.execute = [client.allowInsecureRequests]; // eslint-disable-line @typescript-eslint/no-deprecated
    if (config.sslInsecure) {
      options[client.customFetch] = insecureFetch;
      logger.warning({ service: "auth", message: `OIDC '${config.label}' (${config.id}): SSL verification disabled -- not safe for production` });
    }

    try {
      this.cachedMetadata = await client.discovery(
        issuerUrl,
        config.clientId,
        { client_secret: config.secret, token_endpoint_auth_method: "client_secret_post" },
        undefined,
        Reflect.ownKeys(options).length ? options : undefined,
      );
    } catch (error: any) {
      logger.error({
        service: "auth",
        message: `OIDC '${config.label}' (${config.id}) discovery failed: ${error.message}`,
        cause: error.cause?.message,
        issuerUrl: issuerUrl.href,
      });
      throw error;
    }
    return this.cachedMetadata;
  }

  async authenticate(event: AuthEvent, _credentials: any) {
    const client = await import("openid-client");
    const config = this.config;

    const metadata = await this.discover();

    const randomState = client.randomState();
    const nonce = client.randomNonce();
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    // Full provider key encoded in state so the callback can dispatch without family-specific logic
    const state = `oidc:${config.id}~${randomState}`;

    const scopeAdditions = this.extractor.buildScopeAdditions();
    const scope = ["openid", "profile", "email", ...scopeAdditions].join(" ");
    logger.debug({ service: "auth", message: `OIDC '${config.label}' (${config.id}) requesting scope: ${scope}` });

    const authorizationUrl = client.buildAuthorizationUrl(metadata, {
      client_id: config.clientId,
      redirect_uri: config.callback,
      scope,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    event.context.auth = { state, nonce, codeVerifier };
    return { redirect: authorizationUrl };
  }

  private async resolveFromTokens(event: AuthEvent) {
    const client = await import("openid-client");
    const config = this.config;
    const metadata = await this.discover();

    const { state, nonce, codeVerifier } = event.context.auth || {};
    if (!state) throw new Error("Missing state");
    if (!nonce) throw new Error("Missing nonce");
    if (!codeVerifier) throw new Error("Missing PKCE code verifier");

    const fullUrl = `${event.node.req.headers["x-forwarded-proto"] || "http"}://${
      event.node.req.headers.host
    }${event.node.req.url}`;
    const callbackUrl = new URL(fullUrl);

    let tokens;
    try {
      tokens = await client.authorizationCodeGrant(
        metadata,
        callbackUrl,
        { expectedState: state, expectedNonce: nonce, pkceCodeVerifier: codeVerifier },
      );
    } catch (error: any) {
      logger.error({
        service: "auth",
        message: `OIDC '${config.label}' (${config.id}) token exchange failed: ${error.message}`,
        cause: error.cause?.message ?? error.cause,
        code: error.code,
      });
      if (error.response?.headers) {
        logger.error({
          service: "auth",
          message: `Token exchange headers: ${JSON.stringify(error.response.headers)}`,
        });
      }
      throw new Error("Token exchange failed.");
    }

    const idTokenClaims = tokens.claims();
    const sub = idTokenClaims?.sub;

    if (!sub || typeof sub !== "string") {
      throw new Error("ID token is missing a valid subject (sub) claim.");
    }

    const groups = this.extractor.extractGroups(idTokenClaims);
    const userRoleIds = this.extractor.getAllMatchingRoles(groups);

    logger.debug({
      service: "auth",
      message: `OIDC '${config.label}' (${config.id}) group resolution -- groups=${JSON.stringify(groups)}, roles=${JSON.stringify(userRoleIds)}`,
    });

    let userRoleId: number | null = null;
    if (userRoleIds.includes(2)) userRoleId = 2;
    else if (userRoleIds.includes(1)) userRoleId = 1;

    const email = String(idTokenClaims.email ?? "");
    const firstName = String(idTokenClaims.given_name || "Unknown");
    const lastName = String(idTokenClaims.family_name || "Unknown");

    if (!email) throw new Error("ID token is missing an email claim.");

    return { email, firstName, lastName, groups, userRoleId };
  }

  async handleCallback(event: AuthEvent) {
    const config = this.config;
    const { email, firstName, lastName, userRoleId } = await this.resolveFromTokens(event);

    if ((config.groupMappings || "").length > 0 && !userRoleId) {
      throw new H3Error("Unauthorized: You do not belong to any permitted groups.");
    }

    return this.finalizeLogin(event, { email, firstName, lastName }, "oidc", userRoleId);
  }

  async handleTestCallback(event: AuthEvent): Promise<TestLoginResult> {
    const config = this.config;
    const { email, firstName, lastName, groups, userRoleId } = await this.resolveFromTokens(event);
    const denied = (config.groupMappings || "").length > 0 && userRoleId === null;

    return { providerId: config.id, email, firstName, lastName, groups, userRoleId, denied };
  }
}
