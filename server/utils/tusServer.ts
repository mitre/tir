import { randomUUID } from "node:crypto";
import type { H3Event } from "h3";
import { DateTime } from "luxon";
import { Op } from "sequelize";
import { Server, MemoryLocker } from "@tus/server";
import { FileStore } from "@tus/file-store";
import { runImportJob } from "./runImportJob";
import { ImportJob } from "~/db/models";

let tusServer: Server | null = null;

const HEARTBEAT_THROTTLE_MS = 5_000;
const lastHeartbeatAt = new Map<string, number>();

function uploadError(statusCode: number, body: string): never {
  const err = new Error(body) as Error & { status_code: number; body: string };
  err.status_code = statusCode;
  err.body = body;
  throw err;
}

function uploadIdFromJobId(jobId: string | undefined): string {
  return jobId || randomUUID();
}

const NOT_YET_PROCESSING_STATUSES = ["queued", "uploading"];

async function recordUploadStillAlive(jobId: string): Promise<void> {
  const now = Date.now();
  if (now - (lastHeartbeatAt.get(jobId) ?? 0) < HEARTBEAT_THROTTLE_MS) return;
  lastHeartbeatAt.set(jobId, now);

  await ImportJob.update(
    { status: "uploading", lastUpdate: DateTime.now().toISO() },
    { where: { uid: jobId, status: { [Op.in]: NOT_YET_PROCESSING_STATUSES } } },
  );
}

function getTusServer(): Server {
  if (tusServer) return tusServer;

  const config = useRuntimeConfig();

  tusServer = new Server({
    path: "/api/uploads",
    datastore: new FileStore({ directory: config.temp_folder }),
    locker: new MemoryLocker(),
    maxSize: 500 * 1024 * 1024,
    relativeLocation: true,
    // The fallback lets a missing jobId reach onUploadCreate's clean 400
    // instead of throwing here.
    namingFunction: (_req, metadata) => uploadIdFromJobId(metadata?.jobId),
    onUploadCreate(_req, upload) {
      const filename = upload.metadata?.filename;
      if (!upload.metadata?.jobId) {
        uploadError(400, "Missing jobId metadata.");
      }
      if (!filename) {
        uploadError(400, "Missing filename metadata.");
      }
      if (!filename.toLowerCase().endsWith(".zip")) {
        uploadError(400, "File must be a .zip STIG Library compilation.");
      }
      return Promise.resolve({});
    },
    async onIncomingRequest(_req, jobIdAsUploadId) {
      if (!jobIdAsUploadId) return;
      await recordUploadStillAlive(jobIdAsUploadId);
    },
    async onUploadFinish(_req, upload) {
      const uid = upload.metadata?.jobId;
      const filename = upload.metadata?.filename;
      const filepath = upload.storage?.path;

      if (uid) lastHeartbeatAt.delete(uid);

      if (uid && filename && filepath) {
        await ImportJob.update(
          { status: "processing", lastUpdate: DateTime.now().toISO() },
          { where: { uid } },
        );
        runImportJob(uid, filepath, filename).catch(() => {});
      } else {
        logger.error({
          service: "upload",
          message: `tus upload finished without jobId/filename metadata (id=${upload.id})`,
        });
      }
      return {};
    },
  });

  return tusServer;
}

export async function handleTusUpload(event: H3Event) {
  if (event.node.req.method !== "OPTIONS") {
    await userCheck(event, undefined, undefined, undefined);
  }
  await getTusServer().handle(event.node.req, event.node.res);
}
