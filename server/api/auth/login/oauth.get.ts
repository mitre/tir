import { defineEventHandler, getQuery, setCookie, sendRedirect } from "h3";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";
import { AUTH_COOKIES, clearAuthCookie } from "~/server/utils/authCookies";

export default defineEventHandler(async (event) => {
  try {
    clearAuthCookie(event, AUTH_COOKIES.STATE);

    const authService = getAuthServiceManager();
    const query = getQuery(event);

    let providerId = query.provider as string | undefined;
    if (!providerId) {
      const enabled = authService.getEnabledOAuthProviders();
      if (enabled.length === 0) throw new Error("No OAuth providers are enabled.");
      if (enabled.length > 1)
        throw new Error("Multiple OAuth providers are enabled -- specify ?provider=<id>.");
      providerId = enabled[0].id;
    }

    const result = await authService.authenticate(`oauth:${providerId}`, event, {});

    if (result.redirect) {
      setCookie(event, AUTH_COOKIES.STATE, event.context.auth.state, { httpOnly: true, sameSite: "lax", path: "/" });
      if (query.test === "true") {
        setCookie(event, AUTH_COOKIES.TEST_MODE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 300 });
      }
      return sendRedirect(event, result.redirect);
    }

    return { success: true, message: "Redirecting to OAuth provider..." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});
