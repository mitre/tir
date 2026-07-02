import { Op } from "sequelize";
import { DateTime } from "luxon";
import { waitForSignal } from "../utils/startupSync";
import { ImportJob } from "~/db/models";

export default defineNitroPlugin(async () => {
  try {
    await waitForSignal("db");
    const [count] = await ImportJob.update(
      {
        status: "error",
        error: "Import interrupted by a server restart.",
        lastUpdate: DateTime.now().toISO(),
      },
      { where: { status: { [Op.in]: ["queued", "uploading", "processing"] } } },
    );
    if (count > 0) {
      logger.warning({
        service: "ImportJob",
        message: `Marked ${count} interrupted import job(s) as error on startup.`,
      });
    }
  } catch (error) {
    logSequelizeError(error);
  }
});
