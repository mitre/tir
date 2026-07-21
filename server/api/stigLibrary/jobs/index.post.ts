import { randomUUID } from "node:crypto";
import { DateTime } from "luxon";
import { removeStaleAndFindBlockingJob, withInProcessImportClaim } from "~/server/utils/importLock";
import { ImportJob } from "~/db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const filename = body?.filename;
  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: "filename is required." });
  }

  if (!String(filename).toLowerCase().endsWith(".zip")) {
    throw createError({
      statusCode: 400,
      statusMessage: "File must be a .zip STIG Library compilation.",
    });
  }

  const uid = randomUUID();

  const blocking = await withInProcessImportClaim(async () => {
    const active = await removeStaleAndFindBlockingJob();
    if (active) return active;

    const now = DateTime.now().toISO();
    await ImportJob.create({
      uid,
      filename,
      status: "queued",
      percent: 0,
      createdBy: checkResult.user?.id ?? null,
      creationDate: now,
      lastUpdate: now,
    });
    return null;
  });

  if (blocking) {
    throw createError({
      statusCode: 409,
      statusMessage: `An import is already in progress (${blocking.filename}). Wait for it to finish before starting another.`,
    });
  }

  return { jobId: uid };
});
