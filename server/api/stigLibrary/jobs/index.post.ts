import { randomUUID } from "node:crypto";
import { DateTime } from "luxon";
import { parseLibraryName } from "~/server/utils/stigLibrary";
import { ImportJob } from "~/db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);

  const body = await readBody(event);
  const filename = body?.filename;
  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: "filename is required." });
  }

  const parsed = parseLibraryName(filename);
  if (parsed.error) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.errorMessage || "The file doesn't appear to be a STIG Library.",
    });
  }

  const uid = randomUUID();
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

  return { jobId: uid };
});
