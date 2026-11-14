import { randomBytes } from "crypto";
import { H3Event, setCookie, getCookie } from "h3";
import { DateTime } from "luxon";
import { Session } from "~/db/models/session";
import { User } from "~/db/models/user";
import { UserRole } from "~/db/models/userRole";

const SESSION_COOKIE_NAME = "tirsession";
const SESSION_EXPIRY_HOURS = 2;
const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_HOURS * 60 * 60;
const SESSION_EXTEND_THRESHOLD_HOURS = SESSION_EXPIRY_HOURS / 2;

export class SessionService {
  async createSession(UserId: number, event: H3Event, data: Record<string, any> = {}) {
    await this.deleteSessionsForUser(UserId);

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
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_EXPIRY_SECONDS,
    });

    return id;
  }

  async validateSession(event: H3Event) {
    const id = getCookie(event, SESSION_COOKIE_NAME);
    if (!id) return null;

    const session = await Session.findOne({
      where: { id },
      include: [{ model: User, include: [UserRole] }],
    });

    if (!session || DateTime.fromISO(session.expiresAt) < DateTime.now()) {
      await this.destroySession(id);
      return null;
    }

    // Extend when less than half the lifetime remains limits DB writes for active users
    const remaining = DateTime.fromISO(session.expiresAt).diff(DateTime.now(), "hours").hours;
    if (remaining < SESSION_EXTEND_THRESHOLD_HOURS) {
      const newExpiry = DateTime.now().plus({ hours: SESSION_EXPIRY_HOURS }).toISO();
      await session.update({ expiresAt: newExpiry });
      setCookie(event, SESSION_COOKIE_NAME, id, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_EXPIRY_SECONDS,
      });
    }

    return session;
  }

  async destroySession(id: string) {
    await Session.destroy({ where: { id } });
  }

  async deleteSessionsForUser(userId: number) {
    await Session.destroy({ where: { UserId: userId } });
  }
}
