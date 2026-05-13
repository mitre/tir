import { User } from "~/db/models/user";
import { SessionService } from "./sessionService";
import type { AuthEvent } from "~/types/auth";

const sessionService = new SessionService();

export abstract class AuthProvider {
  abstract init(): Promise<void>;
  abstract authenticate(event: AuthEvent, credentials?: any): Promise<any>;
  handleCallback?(event: AuthEvent): Promise<any>;
  validateToken?(token: string): Promise<any>;

  protected async finalizeLogin(
    event: AuthEvent,
    profile: { email: string; firstName: string; lastName: string },
    authMethod: string,
    userRoleId: number | null = null,
  ): Promise<{ sessionId: string; user: any }> {
    const { email, firstName, lastName } = profile;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        UserRoleId: userRoleId ?? 2,
        TimezoneId: 1,
        creationMethod: authMethod,
      });
      logger.info({ service: "auth", message: `Created new local user for ${authMethod} login: ${email}` });
    }

    if (userRoleId && user.UserRoleId !== userRoleId) {
      user.UserRoleId = userRoleId;
      await user.save();
      logger.info({ service: "auth", message: `User role updated for ${email} to RoleId ${userRoleId}` });
    }

    logger.info({ service: "auth", message: `Successful ${authMethod} login for: ${email}` });

    const sessionId = await sessionService.createSession(user.id, event, {
      authMethod,
      ipAddress: event.node.req.headers["x-forwarded-for"] || event.node.req.socket?.remoteAddress,
      userAgent: event.node.req.headers["user-agent"],
    });

    return { sessionId, user };
  }
}
