import { webcrypto } from "crypto";
import { H3Error } from "h3";
import { AuthProvider } from "./authProvider";
import { SessionService } from "./sessionService";
import { GroupScopeProcessor, GroupRoleMapping } from "./groupScopeProcessor";
import { User } from "~/db/models/user";
import { UserRole } from "~/db/models";
import { AuthEvent } from "~/types/auth";

const sessionService = new SessionService();

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown as Crypto;
}

export class OIDCAuthProvider extends AuthProvider {
  private config: any;
  private groupScopeProcessor!: GroupScopeProcessor;

  constructor(config: any) {
    super();
    this.config = config;
  }

  async init(): Promise<void> {
    const config = this.config;
    const groupRoleMappings: GroupRoleMapping[] = (config.oidcGroupMappings || "")
      .split(",")
      .filter(Boolean)
      .map((mapping: string) => {
        const [groupName, roleId] = mapping.split(":");
        return { groupName, userRoleId: parseInt(roleId, 10) };
      });

    logger.debug({ service: "auth", message: `OIDC group-to-role mappings: ${groupRoleMappings}` });

    this.groupScopeProcessor = new GroupScopeProcessor({
      useStandardGroupsClaim: true,
      groupRoleMappings,
    });
  }

  async authenticate(event: AuthEvent, _credentials: any) {
    const client = await import("openid-client");
    const config = this.config;

    const metadata = await client.discovery(new URL(config.oidcUrl), config.oidcClientId, {
      client_secret: config.oidcSecret,
      token_endpoint_auth_method: "client_secret_post",
    });

    const state = client.randomState();

    const configuredGroupScopes: string[] = (config.oidcGroupMappings || "")
      .split(",")
      .filter(Boolean)
      .map((entry: string) => {
        const [groupName] = entry.split(":");
        return `group:${groupName.toLowerCase()}`;
      });

    const scope = ["openid", "profile", "email", ...configuredGroupScopes].join(" ");
    logger.debug({ service: "auth", message: `OIDC scope used ${scope}` });

    const authorizationUrl = client.buildAuthorizationUrl(metadata, {
      client_id: config.oidcClientId,
      redirect_uri: config.oidcCallback,
      scope,
      state,
    });

    event.context.auth = { state };
    return { redirect: authorizationUrl };
  }

  async handleCallback(event: AuthEvent) {
    const client = await import("openid-client");
    const config = this.config;

    const metadata = await client.discovery(new URL(config.oidcUrl), config.oidcClientId, {
      client_secret: config.oidcSecret,
      token_endpoint_auth_method: "client_secret_post",
    });

    const { state } = event.context.auth || {};
    if (!state) throw new Error("Missing state");

    const fullUrl = `${event.node.req.headers["x-forwarded-proto"] || "http"}://${
      event.node.req.headers.host
    }${event.node.req.url}`;
    const callbackUrl = new URL(fullUrl);

    let tokens;
    try {
      tokens = await client.authorizationCodeGrant(metadata, callbackUrl, {
        expectedState: state,
      });
    } catch (error: any) {
      logger.error({ service: "auth", message: `Token exchange failed: ${error.message}` });
      if (error.response?.headers)
        logger.error({
          service: "auth",
          message: `Token exchange Headers: ${error.response.headers}`,
        });
      throw new Error("Token exchange failed.");
    }

    const tokenSet = tokens as unknown as { claims: () => any; scope?: string };
    const idTokenClaims = tokenSet.claims();
    const rawScope = idTokenClaims.scope;
    const expectedSubject = idTokenClaims?.sub;

    if (!expectedSubject || typeof expectedSubject !== "string") {
      throw new Error("ID token is missing a valid subject (sub) claim.");
    }

    const groupScopes = this.groupScopeProcessor.extractGroups(rawScope);
    const userRoleIds = this.groupScopeProcessor.getAllMatchingRoles(groupScopes);

    let userRoleId = null;
    if (userRoleIds) {
      if (userRoleIds.includes(2)) {
        userRoleId = 2;
      } else if (userRoleIds.includes(1)) {
        userRoleId = 1;
      }
    }

    if ((this.config.oidcGroupMappings || "").length > 0 && !userRoleId) {
      throw new H3Error("Unauthorized: You do not belong to any permitted groups.");
    }

    let user = await User.findOne({ where: { email: tokenSet.claims().email } });
    if (!user) {
      user = await User.create({
        firstName: tokenSet.claims().given_name || "Unknown",
        lastName: tokenSet.claims().family_name || "Unknown",
        email: tokenSet.claims().email,
        UserRoleId: userRoleId!,
        TimezoneId: 1,
        creationMethod: "oidc",
      });
      logger.info({
        service: "Auth",
        message: `Created new local user for OIDC user: ${tokenSet.claims().email}`,
      });
    }

    if (user.UserRoleId !== userRoleId) {
      user.UserRoleId = userRoleId;
      await user.save();
      logger.info({
        service: "auth",
        message: `User role modified for user: ${
          tokenSet.claims().email
        }.  New UserRoleId: ${userRoleId}`,
      });
    }

    logger.info({
      service: "auth",
      message: `Successful login for user: ${tokenSet.claims().email}`,
    });

    const sessionId = await sessionService.createSession(user.id, event, {
      authMethod: "oidc",
      ipAddress: event.node.req.headers["x-forwarded-for"] || event.req.socket.remoteAddress,
      userAgent: event.node.req.headers["user-agent"],
    });

    return { sessionId, user };
  }
}
