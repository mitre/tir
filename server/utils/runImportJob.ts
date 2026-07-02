/* eslint-disable camelcase */
import * as fs from "fs";
import { DateTime } from "luxon";
import { processLibrary } from "./stigLibrary";
import { createJobReporter } from "./jobReporter";
import { ImportJob, TirNotification, TirNotifications_User, User } from "~/db/models";

const LIBRARY_NOTIFICATION_CATEGORY = 3;

async function notifyLibraryAvailable(createdBy: number | null, filename: string) {
  const allUsers = await User.findAll({ attributes: ["id"] });
  const newNotification = await TirNotification.create({
    message: `STIG Library ${filename} is now available! `,
    NotificationCategoryId: LIBRARY_NOTIFICATION_CATEGORY,
    UserId: createdBy ?? undefined,
  } as never);

  for (const user of allUsers) {
    await newNotification.addUser(user.id);
    const userNotification = await TirNotifications_User.findOne({
      where: { UserId: user.id, TirNotificationId: newNotification.id },
    });
    userNotification?.setDataValue("read", false);
    await userNotification?.save();
  }
}

export async function runImportJob(uid: string, zipArchive: string, originalFilename: string) {
  const config = useRuntimeConfig();
  const reporter = createJobReporter(uid);

  try {
    await ImportJob.update(
      { status: "processing", lastUpdate: DateTime.now().toISO() },
      { where: { uid } },
    );
    reporter.status("Processing started...");

    const results = await processLibrary(zipArchive, config.temp_folder, originalFilename, reporter);

    reporter.status("Processing Completed!");
    reporter.complete();

    const job = await ImportJob.findOne({ where: { uid } });
    await ImportJob.update(
      {
        status: "done",
        percent: 100,
        message: "Processing Completed!",
        result: JSON.stringify(results),
        lastUpdate: DateTime.now().toISO(),
      },
      { where: { uid } },
    );

    logger.info({
      service: "Library",
      message: `Uploaded STIG Library:${originalFilename}`,
    });

    await notifyLibraryAvailable(job?.createdBy ?? null, originalFilename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    reporter.error(`Error occurred during processing: ${message}`);
    logger.error(`Failed STIG Library Processing:${originalFilename}`);
  } finally {
    try {
      fs.rmSync(`${zipArchive}.json`, { force: true });
    } catch {
      // tus metadata sidecar may already be gone
    }
  }
}
