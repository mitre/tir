import { logger } from "~/server/utils/logger";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", (error, context) => {
    const statusCode = error?.statusCode;
    const isClientError = typeof statusCode === "number" && statusCode < 500;
    if (isClientError) return;

    const event = context?.event;
    const where = event ? `${event.method} ${event.path}` : "unknown route";
    logger.error({
      service: "nitro-error",
      message: `Unhandled error on ${where} ${statusCode ?? ""}: ${error?.message || error}`.trim(),
    });
  });
});
