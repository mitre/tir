import { webcrypto } from "crypto";
import * as client from "openid-client";
import { H3Event } from "h3";
import { AuthProvider } from "./authProvider";
import { SessionService } from "./sessionService";
import { User } from "~/db/models/user";

const config = useRuntimeConfig();
const clientSecret = config.OIDC_SECRET;

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown as Crypto;
}

const sessionService = new SessionService();

export class OIDCAuthProvider extends AuthProvider {
  private clientConfig!: client.Configuration;

  constructor() {
    super();
    this.initializeClient();
  }

  async initializeClient() {
    // TODO: Remove after testing - Allow HTTP for localhost development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Use the modern discovery method with the URL object
    // const serverUrl = new URL("https://localhost:8443/realms/nuxt");
    const serverUrl = new URL(config.oidc_url);
    this.clientConfig = await client.discovery(serverUrl, "my-nuxt-app", clientSecret);
    console.log("Discovered OIDC configuration", this.clientConfig);
  }

  async authenticate(event: H3Event, credentials: any) {
    if (!this.clientConfig) {
      throw new Error("OIDC client not initialized");
    }

    // const redirectUri = "http://localhost:3000/api/auth/callback";
    const redirectUri = config.oidc_callback;
    const scope = "openid profile email ";

    // Generate PKCE and state using openid-client's new utility functions
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    const parameters: Record<string, string> = {
      redirectUri,
      scope,
      codeChallenge,
      code_challenge_method: "S256",
      state,
    };

    const authorizationUrl = client.buildAuthorizationUrl(this.clientConfig, parameters);
    console.log("Redirecting to", authorizationUrl);

    event.context.auth = { codeVerifier, state };

    return { redirect: authorizationUrl };
  }

  async handleCallback(event: H3Event) {
    if (!this.clientConfig) {
      throw new Error("OIDC client not initialized");
    }

    const { codeVerifier, state } = event.context.auth || {};
    if (!codeVerifier || !state) {
      throw new Error("Missing PKCE code_verifier or state");
    }

    // Manually parse the OAuth 2.0 callback parameters from the request
    const callbackUrl = new URL(event.node.req.url!, "http://localhost:3000");
    const params = Object.fromEntries(new URLSearchParams(callbackUrl.search));

    // Exchange the authorization code for tokens
    const tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant(
      this.clientConfig,
      callbackUrl,
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: state,
      },
    );

    console.log("Token Endpoint Response", tokens);

    const tokenSet = tokens as unknown as { claims: () => any };
    const idTokenClaims = tokenSet.claims();
    const expectedSubject = idTokenClaims?.sub;

    if (!expectedSubject || typeof expectedSubject !== "string") {
      throw new Error("ID token is missing a valid subject (sub) claim.");
    }

    if (idTokenClaims.groups) {
      console.log("Retrieved groups from ID token:", idTokenClaims.groups);
    } else {
      console.log("No gorpus found in ID token.");
    }

    // Fetch user information from the OIDC provider
    const userInfo = await client.fetchUserInfo(
      this.clientConfig,
      tokens.access_token,
      expectedSubject,
    );
    if (userInfo.groups) {
      console.log("Retrieved groups from user info:", userInfo.groups);
    } else {
      console.log("No groups found in user info.");
    }
    let user = await User.findOne({ where: { email: userInfo.email } });

    if (!user) {
      user = await User.create({
        firstName: userInfo.given_name || "Unknown",
        lastName: userInfo.family_name || "Unknown",
        email: userInfo.email,
        UserRoleId: 1,
        TimezoneId: 1,
        creationMethod: "oidc",
      });
    }

    const sessionId = await sessionService.createSession(user.id, event, {
      authMethod: "oidc",
      ipAddress: event.node.req.headers["x-forwarded-for"] || event.req.socket.remoteAddress,
      userAgent: event.node.req.headers["user-agent"],
    });

    return { sessionId, user };
  }

  // TODO: Implement subject in user table and storage/retrieval
  async validateToken(token: string): Promise<any> {
    if (!this.clientConfig) {
      throw new Error("OIDC client not initialized");
    }

    try {
      // TODO: Add subjectId from user table here
      const expectedSubject = "";
      const userInfo = await client.fetchUserInfo(this.clientConfig, token, expectedSubject);
      return userInfo;
    } catch (error) {
      console.error(`OIDC token validation failed: ${error.message}`);
      return null;
    }
  }
}
