import { TirConfig } from "~/db/models/tirConfig";
import { canReadWrite } from "~/server/utils/file";

export default defineNitroPlugin(async (nitro) => {
  try {
    const logPath = (await TirConfig.findOne({ where: { key: "logger_logPath" } }))?.value ?? "tmp";

    if (!canReadWrite(logPath)) {
      logger.error({
        service: "logger",
        message: `Insufficient Permissions to read/write to ${logPath}`,
      });
    }
  } catch (error) {
    logger.error(error);
  }
});
