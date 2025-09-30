import { defineEventHandler, H3Error } from "h3";
import { SessionService } from "../../auth/sessionService";
import { User, UserRole, Theme } from "../../../db/models";

const sessionService = new SessionService();

export default defineEventHandler(async (event) => {
  try {
    // Validate the session using SessionService
    const session = await sessionService.validateSession(event);

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized Access - Invalid or Expired Session",
      });
    }

    const user = await User.findByPk(session.UserId, {
      attributes: ["id", "firstName", "lastName", "email", "TimezoneId", "ThemeId"],
      include: [
        {
          model: UserRole,
          attributes: ["id", "name"],
        },
        {
          model: Theme,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: `User not found: ${session.UserId}`,
      });
    }

    return user;
  } catch (error) {
    if (error instanceof H3Error) {
      return error;
    } else {
      return createError({
        statusCode: 401,
        statusMessage: "Unauthorized Access",
      });
    }
  }
});
