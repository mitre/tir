import { defineEventHandler, deleteCookie, getCookie, createError } from "h3";
import { SessionService } from "../../auth/sessionService";
import { User } from "../../../db/models/user";
import { UserRole } from "../../../db/models/userRole";

const sessionService = new SessionService();

export default defineEventHandler(async (event) => {
  const cookieName = "tirsession";
  const sessionId = getCookie(event, cookieName);

  if (sessionId) {
    logger.info({
      service: "Auth",
      message: `Logging out session ID: ${sessionId}`,
    });

    // Fetch the session and associated user before destroying the session
    const session = await sessionService.validateSession(event);

    // TODO: User info should already be in session
    if (session && session.UserId) {
      const user = await User.findByPk(session.UserId, {
        attributes: ["id", "firstName", "lastName", "email"],
        include: [
          {
            model: UserRole,
            attributes: ["id", "name"],
          },
        ],
      });

      if (user) {
        logger.info({
          service: "Auth",
          message: `User ${user.firstName} ${user.lastName} (${user.email}) is logging out.`,
        });
      } else {
        logger.info({
          service: "Auth",
          message: `User not found for session ID: ${sessionId}`,
        });
      }
    } else {
      logger.info({
        service: "Auth",
        message: `Invalid or expired session: ${sessionId}`,
      });
    }

    // Destroy the session in the database
    await sessionService.destroySession(sessionId);

    // Delete the session cookie
    deleteCookie(event, cookieName, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true, message: "Logged out successfully" };
  } else {
    logger.info({
      service: "Auth",
      message: "No active session found to log out.",
    });

    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - No active session",
    });
  }
});
