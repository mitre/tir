import { defineEventHandler, getCookie, H3Error, sendRedirect } from "h3";
import { OIDCAuthProvider } from "~/server/auth/oidcAuthProvider";

const oidcAuthProvider = new OIDCAuthProvider();

export default defineEventHandler(async (event) => {
  try {
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

    // sendRedirect(event, '/dashboard');
    // return { success: true, data: result };

    return sendRedirect(event, "/home");
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
