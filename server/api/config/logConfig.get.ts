import * as fs from "fs";

export default defineEventHandler(async (event) => {
  const logConfigPath = "config/logConfig.json";

  try {
    if (fs.existsSync(logConfigPath)) {
      fs.accessSync(logConfigPath, fs.constants.R_OK);
      const fileContent = fs.readFileSync(logConfigPath, "utf-8");
      const logConfig = JSON.parse(fileContent);
      return logConfig;
    }
    return {
      logPath: "tmp",
      syslogTarget: "",
      syslogPort: 0,
      logLevel: "warning",
    };
  } catch (err) {
    logger.error("Unable to read log configuration");
    throw createError({
      statusCode: 404,
      statusMessage: "Erorr reading log configuration",
    });
  }
});
