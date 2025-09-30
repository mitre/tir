import { getNotificationTimeout, setNotificationTimeout } from "~/server/utils/notifications";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === "GET") {
    const timeout = await getNotificationTimeout();
    return { timeout };
  }

  if (method === "PUT") {
    const body = await readBody<{ timeout: number }>(event);
    if (typeof body.timeout !== "number") {
      throw createError({ statusCode: 400, message: "Invalid timeout" });
    }
    await setNotificationTimeout(body.timeout);
    return { success: true };
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});
