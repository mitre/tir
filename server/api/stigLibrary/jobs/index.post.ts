import { randomUUID } from "node:crypto";
import { DateTime } from "luxon";
import {
  libraryDeletionInProgress,
  removeStaleAndFindBlockingJob,
  withInProcessImportClaim,
} from "~/server/utils/importLock";
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

  const blockedBy = await withInProcessImportClaim(async () => {
    const deletion = libraryDeletionInProgress();
    if (deletion) return `${deletion} is in progress`;

    const active = await removeStaleAndFindBlockingJob();
    if (active) return `an import is already in progress (${active.filename})`;

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

  if (blockedBy) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot start the import: ${blockedBy}. Wait for it to finish.`,
    });
  }

  return { jobId: uid };
});
