import { defineEventHandler, getCookie, deleteCookie, H3Error, sendRedirect } from "h3";
import { OIDCAuthProvider } from "~/server/auth/oidcAuthProvider";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";

// let oidcAuthProvider: OIDCAuthProvider | null = null;

export default defineEventHandler(async (event) => {
  try {
    const authService = getAuthServiceManager();
    const oidcAuthProvider = authService.getProvider("oidc");

    if (!oidcAuthProvider || typeof oidcAuthProvider.handleCallback !== "function") {
      throw new H3Error("OIDC provider is not enabled or misconfigured.");
    }

    const codeVerifier = getCookie(event, "pkce_code_verifier");
    const state = getCookie(event, "pkce_state");

    if (!codeVerifier || !state) {
      throw new H3Error("Missing PKCE code_verifier or state from cookies.");
    }

    event.context.auth = { codeVerifier, state };

    const result = await oidcAuthProvider.handleCallback(event);

    if (!result || !result.sessionId) {
      throw new H3Error("Failed to handle OIDC callback or create session.");
    }

    deleteCookie(event, "pkce_code_verifier");
    deleteCookie(event, "pkce_state");

    const redirectUrl = `/home`;
    logger.debug({ service: "auth", message: `Redirecting to ${redirectUrl}` });
    return sendRedirect(event, redirectUrl);
  } catch (error) {
    let errorMessage = "An unknown error occurred during OIDC callback";
    if (error instanceof H3Error) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`OIDC Callback Error: ${errorMessage}`);
    return { success: false, message: errorMessage };
  }
});
