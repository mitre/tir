import { IncomingMessage } from "http";
import formidable from "formidable";
import { processLibrary, parseLibraryName } from "../../utils/stigLibrary";
import { User } from "~/db/models";
import { createProgressStreamer, ProgressStreamer } from "~/server/utils/progressBar";

const config = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const allUsers = await User.findAll({
    attributes: ["email", "id"],
  });
  const BoundaryUsers = [{}];
  for (let i = 0; i < allUsers.length; i++) {
    BoundaryUsers[i] = { UserId: allUsers[i].id };
  }

  const res = event.node.res;
  const req = event.node.req;

  const streamer = createProgressStreamer(res);

  streamer.status("Processing started...");

  const body = await proccessNodeRequest(req, streamer);
  const zipArchive = body.file[0].filepath;
  const originalFilename = body.file[0].originalFilename;

  const libraryNameAttributes = await parseLibraryName(originalFilename);

  if (libraryNameAttributes.error) {
    streamer.error("Error: The file doesn't appear to be a STIG Library.");
    logger.error(`User: ${checkResult.user?.email} Failed STIG Library Upload:${originalFilename}`);
    streamer.complete();
    streamer.finish();
    return;
  }

  try {
    const results = await processLibrary(
      zipArchive,
      config.temp_folder,
      originalFilename,
      streamer,
    );
    streamer.status("Processing Completed!");
    streamer.complete();
    streamer.finish();

    logger.info({
      service: "Library",
      message: `User: ${checkResult.user?.email} Uploaded STIG Library:${originalFilename}`,
    });

    await $fetch("/api/config/alert", {
      method: "POST",
      body: {
        BoundaryUsers,
        UserId: checkResult.user.id,
        NotificationCategoryId: 3,
        message: `STIG Library ${originalFilename} is now available! `,
      },
    });
  } catch (error) {
    streamer.error(`Error occurred during processing: ${error.message}`);
    logger.error(
      `User: ${checkResult.user?.email} Failed STIG Library Processing:${originalFilename}`,
    );

    streamer.complete();
    streamer.finish();
  }
});

function proccessNodeRequest(
  req: IncomingMessage,
  streamer: ProgressStreamer,
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 500 * 1024 * 1024,
      uploadDir: config.temp_folder,
      keepExtensions: true,
    });

    let lastPercent = -1;
    let lastLoggedBucket = -1;
    let lastStatusAt = 0;
    let lastStatusBytes = 0;

    const LOG_INTERVAL_MS = 1000;
    const LOG_BYTES_STEP = 25 * 1024 * 1024;

    const hintedLength = Number(req.headers["x-upload-length"] || 0);

    streamer.status("Upload Started");
    streamer.progress(0);

    form.on("progress", (received, expected) => {
      const now = Date.now();
      const elapsedStatus = now - lastStatusAt;
      const deltaBytes = received - lastStatusBytes;

      const total = (expected && expected > 0 ? expected : hintedLength) || 0;

      let shouldLog = false;
      let logLabel = "";

      if (total > 0) {
        const percent = Math.min(100, Math.floor((received * 100) / total)); // 0..100

        if (percent !== lastPercent) {
          const speedBps = elapsedStatus > 0 ? deltaBytes / (elapsedStatus / 1000) : 0;
          const speedMBs = speedBps / 1e6;
          const etaSec = speedBps > 0 ? Math.max(0, (total - received) / speedBps) : null;

          streamer.progress(percent);
          streamer.status(
            `Upload ${percent}% (${received}/${total})` +
              (speedMBs ? ` ~${speedMBs.toFixed(2)} MB/s` : "") +
              (etaSec != null ? ` ETA ${etaSec.toFixed(1)}s` : ""),
          );

          lastPercent = percent;
          lastStatusAt = now;
          lastStatusBytes = received;
        }

        const bucket = Math.floor(percent / 10);
        if (bucket !== lastLoggedBucket) {
          lastLoggedBucket = bucket;
          shouldLog = true;
          logLabel = `${percent}% (${received}/${total})`;
        }
      } else if (elapsedStatus >= LOG_INTERVAL_MS || deltaBytes >= LOG_BYTES_STEP) {
        const speedBps = elapsedStatus > 0 ? deltaBytes / (elapsedStatus / 1000) : 0;
        const speedMBs = speedBps / 1e6;

        streamer.status(
          `Upload ${(received / 1e6).toFixed(1)} MB` +
            (speedMBs ? ` ~${speedMBs.toFixed(2)} MB/s` : ""),
        );

        shouldLog = true;
        logLabel = `${(received / 1e6).toFixed(1)} MB uploaded`;

        lastStatusAt = now;
        lastStatusBytes = received;
      }

      if (shouldLog) {
        const speedBps = elapsedStatus > 0 ? deltaBytes / (elapsedStatus / 1000) : 0;
        const speedMb = (speedBps / 1e6).toFixed(2);
        logger.info({ service: "upload", message: `Upload ${logLabel} ~${speedMb} MB/s` });
      }
    });

    req.on("aborted", () => {
      logger.warning({ service: "upload", message: "Client aborted upload" });
      streamer.status("Upload aborted");
    });

    form.on("end", () => {
      if (lastPercent >= 0 && lastPercent < 100) streamer.progress(100);
      streamer.status("Upload complete");
    });

    form.on("error", (err) => {
      logger.error({ service: "upload", message: `Formidable error: ${err.message}` });
      streamer.error(`Upload error: ${err.message}`);
    });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}
