import { Logger, logger } from "~/server/utils/logger";

export default defineNitroPlugin(async () => {
  try {
    process.title = "tir";

    await Logger.bootstrap();

    logger.info({ service: "logger", message: "Logger initialized (bootstrap)." });
    logger.info({ service: "tir", message: `Process: ${process.title}` });
    logger.info({ service: "logger", message: "Log started." });
  } catch (error) {
    logger.error({ service: "logger", message: "Bootstrap error", error });
  }
});
