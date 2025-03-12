import { defineEventHandler, setCookie, sendRedirect } from "h3";
import { AuthService } from "~/server/auth/authService";

const authService = new AuthService();

// Delay helper function for debugging
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function clearCookie(event: any, name: string) {
  setCookie(event, name, "", {
    path: "/",
    expires: new Date(0),
  });
}

export default defineEventHandler(async (event) => {
  try {
    clearCookie(event, "pkce_code_verifier");
    clearCookie(event, "pkce_state");

    const result = await authService.authenticate("oidc", event, {});
    if (result.redirect) {
      // Persist PKCE values in cookies before redirecting
      await setCookie(event, "pkce_code_verifier", event.context.auth.code_verifier, {
        httpOnly: true,
        sameSite: "lax",
      });
      await setCookie(event, "pkce_state", event.context.auth.state, {
        httpOnly: true,
        sameSite: "lax",
      });

      // Now redirect the browser to the OIDC provider
      return sendRedirect(event, result.redirect);
    }
    return { success: true, message: "Redirecting to OIDC provider..." };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
