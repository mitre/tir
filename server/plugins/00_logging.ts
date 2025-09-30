export default defineNitroPlugin(async () => {
  try {
    process.title = "tir";

    logger.info({ service: "logger", message: "Logger Initialialized." });
    logger.info({ service: "tir", message: `Process: ${process.title}` });
    logger.info({ service: "logger", message: "Log Started." });
  } catch (error) {
    logger.error(error);
  }
});
