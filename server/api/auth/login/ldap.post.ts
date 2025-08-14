import { defineEventHandler, readBody, H3Error } from "h3";
import { AuthService } from "~/server/auth/authService";

const authService = new AuthService();

export default defineEventHandler(async (event) => {
  const { credentials } = await readBody(event);

  if (!credentials?.username || !credentials?.password) {
    throw new H3Error("Username and password are required");
  }

  console.log(`Received LDAP login request for username: ${credentials.username}`);

  try {
    const user = await authService.authenticate("ldap", event, credentials);
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

    logger.error({ service: "Auth", message: `LDAP Authentication error: ${errorMessage}` });

    return { success: false, message: errorMessage };
  }
});
