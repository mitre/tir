export default defineNitroPlugin(async (nitro) => {
  try {
    process.title = 'tir';
    console.log(process.title)
    logger.info("Log Started.")
  } catch (error) {
    logger.error(error);
  }
});
