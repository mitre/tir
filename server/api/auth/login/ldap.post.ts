import { H3Error } from "h3";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";

export default defineEventHandler(async (event) => {
  const { credentials } = await readBody(event);

  if (!credentials?.username || !credentials?.password) {
    throw new H3Error("Username and password are required");
  }

  logger.debug({
    service: "auth",
    message: `Received LDAP login request for username: ${credentials.username}`,
  });

  try {
    const authService = getAuthServiceManager();
    const query = getQuery(event);

    let providerId = query.provider as string | undefined;
    if (!providerId) {
      const enabledIds = authService.getEnabledLDAPIds();
      if (enabledIds.length === 0) throw new H3Error("LDAP authentication is not enabled.");
      providerId = enabledIds[0];
    }

    const ldapProvider = authService.getProvider(`ldap:${providerId}`);
    const user = await ldapProvider.authenticate(event, credentials);

    if (!user) {
      throw new H3Error("Invalid LDAP credentials");
    }

    return { success: true, message: "Authenticated via LDAP", sessionId: user.sessionId, user };
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof H3Error) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    logger.error({ service: "auth", message: `LDAP Authentication error: ${errorMessage}` });
    return { success: false, message: errorMessage };
  }
});
