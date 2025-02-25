import { randomBytes } from "crypto";
import { H3Event, setCookie, getCookie } from "h3";
import { DateTime } from "luxon";
import { Session } from "~/db/models/session";
import { User } from "~/db/models/user";
import { UserRole } from "~/db/models/userRole";

const SESSION_COOKIE_NAME = "tirsession";
// TODO: Move constant to ENV? Config?
const SESSION_EXPIRY_HOURS = 2;

export class SessionService {
  async createSession(UserId: number, event: H3Event, data: Record<string, any> = {}) {
    // TODO: Delete prevoius sessions of the same UserId
    const id = randomBytes(32).toString("hex");
    const expiresAt = DateTime.now().plus({ hours: SESSION_EXPIRY_HOURS }).toISO();

    await Session.create({
      id,
      UserId,
      expiresAt,
      authMethod: data.authMethod || "local",
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      loginTime: DateTime.now().toISO(),
    });

    setCookie(event, SESSION_COOKIE_NAME, id, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return id;
  }

  async validateSession(event: H3Event) {
    // TODO: Extend session on validation
    const id = getCookie(event, SESSION_COOKIE_NAME);
    if (!id) return null;

    const session = await Session.findOne({
      where: { id },
      include: [{ model: User, include: [UserRole] }],
    });

    if (!session || DateTime.fromISO(session.expiresAt) < DateTime.now()) {
      this.destroySession(id);
      return null;
    }

    return session;
  }

  async destroySession(id: string) {
    await Session.destroy({ where: { id } });
  }
}
