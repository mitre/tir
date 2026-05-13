import { defineEventHandler, getQuery, setCookie, sendRedirect } from "h3";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";
import { AUTH_COOKIES, clearAuthCookie } from "~/server/utils/authCookies";

export default defineEventHandler(async (event) => {
  try {
    clearAuthCookie(event, AUTH_COOKIES.STATE);
    clearAuthCookie(event, AUTH_COOKIES.NONCE);
    clearAuthCookie(event, AUTH_COOKIES.CODE_VERIFIER);

    const authService = getAuthServiceManager();
    const query = getQuery(event);

    let providerId = query.provider as string | undefined;
    if (!providerId) {
      const enabled = authService.getEnabledOIDCProviders();
      if (enabled.length === 0) throw new Error("No OIDC providers are enabled.");
      if (enabled.length > 1) throw new Error("Multiple OIDC providers are enabled -- specify ?provider=<id>.");
      providerId = enabled[0].id;
    }

    const result = await authService.authenticate(`oidc:${providerId}`, event, {});

    if (result.redirect) {
      const cookieOpts = { httpOnly: true, sameSite: "lax" as const, path: "/" };
      setCookie(event, AUTH_COOKIES.STATE, event.context.auth.state, cookieOpts);
      setCookie(event, AUTH_COOKIES.NONCE, event.context.auth.nonce, cookieOpts);
      setCookie(event, AUTH_COOKIES.CODE_VERIFIER, event.context.auth.codeVerifier, cookieOpts);
      return sendRedirect(event, result.redirect);
    }

    return { success: true, message: "Redirecting to OIDC provider..." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});
