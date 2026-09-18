import { ImportJob } from "~/db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const uid = getRouterParam(event, "id");
  const job = await ImportJob.findOne({ where: { uid } });
  if (!job) {
    throw createError({ statusCode: 404, statusMessage: "Import job not found." });
  }

  return {
    jobId: job.uid,
    status: job.status,
    percent: job.percent,
    message: job.message,
    error: job.error,
    result: job.result ? JSON.parse(job.result) : null,
    stigLibraryId: job.stigLibraryId,
  };
});
