import { H3Event } from "h3";
import { User } from "../../db/models";
import { UserRole } from "../../db/models/userRole";
import { AuthProvider } from "./authProvider";
import { SessionService } from "./sessionService";
import { verifyPassword } from "~/server/utils/hash";

const sessionService = new SessionService();

export class LocalAuthProvider extends AuthProvider {
  async authenticate(event: H3Event, credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const user = await User.findOne({ where: { email }, include: [UserRole] });

    if (!user || !user.UserRole) {
      logger.info({ service: "auth", message: `Unknown user or missing role: ${email}` });
      throw createError({ statusCode: 401, statusMessage: "Unknown User or Missing Role." });
    }

    const validPassword = verifyPassword(
      password,
      user.password,
      user.salt,
      process.env.SECRET_KEY!,
    );
    if (!validPassword) {
      logger.info({ service: "auth", message: `Bad password for user: ${email}` });
      throw createError({ statusCode: 401, statusMessage: "Bad Password" });
    }

    logger.info({ service: "auth", message: `Successful login for user: ${email}` });

    const sessionId = await sessionService.createSession(user.id, event);

    return { sessionId, userId: user.id };
  }

  async validateToken(token: string) {
    throw new Error("Token validation not implemented for LocalAuthProvider");
  }
}
