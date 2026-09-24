import { ImportJob } from "~/db/models";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const jobs = await ImportJob.findAll({
    where: { status: "processing" },
    order: [["id", "DESC"]],
  });

  return jobs.map((job) => ({
    jobId: job.uid,
    filename: job.filename,
    status: job.status,
    percent: job.percent,
    message: job.message,
    stigLibraryId: job.stigLibraryId,
  }));
});
