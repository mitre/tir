import { TirConfig } from "~/db/models/tirConfig";
import { canReadWrite } from "~/server/utils/file";

export default defineNitroPlugin(async () => {
  try {
    process.title = "tir";

    logger.info({ service: "logger", message: "Logger Initialialized." });
    const logPath = (await TirConfig.findOne({ where: { key: "logger_logPath" } }))?.value ?? "tmp";

    if (!canReadWrite(logPath)) {
      logger.error({
        service: "logger",
        message: `Insufficient Permissions to read/write to ${logPath}`,
      });
    }

    logger.info({ service: "tir", message: `Process: ${process.title}` });
    logger.info({ service: "logger", message: "Log Started." });
  } catch (error) {
    logger.error(error);
  }
});
