import { TirConfig } from "~/db/models/tirConfig";
import { canReadWrite } from "~/server/utils/file";

export default defineNitroPlugin(async (nitro) => {
  try {
    process.title = "tir";

    logger.info("Logger Initialialized.");
    const logPath = (await TirConfig.findOne({ where: { key: "logger_logPath" } }))?.value ?? "tmp";

    if (!canReadWrite(logPath)) {
      console.error("Insufficient Permissions to read/write to", logPath);
    }

    console.log(process.title);
    logger.info("Log Started.");
  } catch (error) {
    logger.error(error);
  }
});
