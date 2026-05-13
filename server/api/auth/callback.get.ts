import { defineEventHandler, getCookie, H3Error, sendRedirect } from "h3";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";
import { AUTH_COOKIES, clearAuthCookie } from "~/server/utils/authCookies";

export default defineEventHandler(async (event) => {
  try {
    const authService = getAuthServiceManager();

    const rawState = getCookie(event, AUTH_COOKIES.STATE);
    const nonce = getCookie(event, AUTH_COOKIES.NONCE);
    const codeVerifier = getCookie(event, AUTH_COOKIES.CODE_VERIFIER);

    if (!rawState) {
      throw new H3Error("Missing state cookie.");
    }

    // State is encoded as "<family>:<providerId>~<oauthState>"
    const tildeIdx = rawState.indexOf("~");
    if (tildeIdx === -1) {
      throw new H3Error("Malformed state cookie.");
    }
    const providerKey = rawState.slice(0, tildeIdx);

    const provider = authService.getProvider(providerKey);

    if (typeof provider.handleCallback !== "function") {
      throw new H3Error(`Provider '${providerKey}' does not support callback authentication.`);
    }

    event.context.auth = { state: rawState, nonce, codeVerifier };

    const result = await provider.handleCallback(event);

    if (!result?.sessionId) {
      throw new H3Error("Failed to handle callback or create session.");
    }

    clearAuthCookie(event, AUTH_COOKIES.STATE);
    clearAuthCookie(event, AUTH_COOKIES.NONCE);
    clearAuthCookie(event, AUTH_COOKIES.CODE_VERIFIER);

    logger.debug({ service: "auth", message: `Auth callback complete for '${providerKey}', redirecting to /home` });
    return sendRedirect(event, "/home");
  } catch (error) {
    let errorMessage = "An unknown error occurred during OIDC callback";
    if (error instanceof H3Error) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    logger.error({ service: "auth", message: `Auth callback error: ${errorMessage}` });
    return { success: false, message: errorMessage };
  }
});
