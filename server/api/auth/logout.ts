import { SessionService } from "~/server/auth/sessionService";

const sessionService = new SessionService();

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, "tirsession");

  if (sessionId) {
    await sessionService.destroySession(sessionId);
    deleteCookie(event, "tirsession");
  }

  return { error: "false" };
});
