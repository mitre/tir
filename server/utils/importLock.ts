import { Op } from "sequelize";
import { DateTime } from "luxon";
import { ImportJob } from "~/db/models";

export const ACTIVE_STATUSES = ["queued", "uploading", "processing"];

const UPLOAD_HEARTBEAT_LOST_MS = 2 * 60_000;
const PROCESSING_SILENCE_LIMIT_MS = 15 * 60_000;

const STALE_AFTER_MS: Record<string, number> = {
  queued: UPLOAD_HEARTBEAT_LOST_MS,
  uploading: UPLOAD_HEARTBEAT_LOST_MS,
  processing: PROCESSING_SILENCE_LIMIT_MS,
};

function isStale(job: ImportJob): boolean {
  const last = DateTime.fromISO(job.lastUpdate);
  if (!last.isValid) {
    logger.warning({
      service: "ImportJob",
      message: `Job ${job.uid} has an unparseable lastUpdate (${job.lastUpdate}); removing it rather than letting it block imports.`,
    });
    return true;
  }
  const limit = STALE_AFTER_MS[job.status] ?? PROCESSING_SILENCE_LIMIT_MS;
  return DateTime.now().diff(last).toMillis() > limit;
}

async function markJobsAbandoned(jobs: ImportJob[]): Promise<void> {
  if (jobs.length === 0) return;
  await ImportJob.update(
    {
      status: "error",
      error: "Import abandoned - no progress reported before it timed out.",
      lastUpdate: DateTime.now().toISO(),
    },
    { where: { id: { [Op.in]: jobs.map((job) => job.id) } } },
  );
  logger.warning({
    service: "ImportJob",
    message: `Marked ${jobs.length} stale import job(s) as abandoned: ${jobs.map((job) => job.uid).join(", ")}`,
  });
}

export async function removeStaleAndFindBlockingJob(): Promise<ImportJob | null> {
  const candidates = await ImportJob.findAll({
    where: { status: { [Op.in]: ACTIVE_STATUSES } },
    order: [["id", "DESC"]],
  });

  const stale: ImportJob[] = [];
  let blocking: ImportJob | null = null;
  for (const job of candidates) {
    if (isStale(job)) stale.push(job);
    else if (!blocking) blocking = job;
  }

  await markJobsAbandoned(stale);
  return blocking;
}

let claimChain: Promise<unknown> = Promise.resolve();

export function withInProcessImportClaim<T>(fn: () => Promise<T>): Promise<T> {
  const run = claimChain.then(fn, fn);
  claimChain = run.then(
    () => {},
    () => {},
  );
  return run;
}
