import * as fs from "fs/promises";
import { verifyControlData } from "../utils/importControl";
import { waitForSignal } from "../utils/startupSync";

export default defineNitroPlugin(async () => {
  try {
    await waitForSignal("db");
    const files = await fs.readdir("./lib/data/");
    for (const file of files) {
      const filePath = `./lib/data/${file}`;
      const result = await verifyControlData(filePath);
      if (result.result === true) {
        await parseControlData(file, filePath);
      }
    }
    logger.info({ service: "SCTM", message: "SCTM Imports Complete" });
  } catch (error) {
    logSequelizeError(error);
    console.error(error);
  }
});
