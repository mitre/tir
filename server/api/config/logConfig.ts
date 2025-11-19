import { Logger } from "~/server/utils/logger";
import { loadLogConfig } from "~/server/utils/config/logConfig";
import type { LogConfig } from "~/types/log";

export default defineEventHandler(async (event) => {
  if (event.method === "GET") {
    return await loadLogConfig();
  }

  if (event.method === "PUT") {
    const body = await readBody<Partial<LogConfig>>(event);
    const updated = await Logger.savePartialAndReload(body);
    return updated;
  }

  throw createError({ statusCode: 405, message: "Method Not Allowed" });
});
