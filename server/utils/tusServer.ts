import type { H3Event } from "h3";
import { DateTime } from "luxon";
import { Server, MemoryLocker } from "@tus/server";
import { FileStore } from "@tus/file-store";
import { parseLibraryName } from "./stigLibrary";
import { runImportJob } from "./runImportJob";
import { ImportJob } from "~/db/models";

let tusServer: Server | null = null;

function uploadError(statusCode: number, body: string): never {
  const err = new Error(body) as Error & { status_code: number; body: string };
  err.status_code = statusCode;
  err.body = body;
  throw err;
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
    onUploadCreate(_req, upload) {
      const filename = upload.metadata?.filename;
      if (!filename) {
        uploadError(400, "Missing filename metadata.");
      }
      const parsed = parseLibraryName(filename);
      if (parsed.error) {
        uploadError(400, parsed.errorMessage || "The file doesn't appear to be a STIG Library.");
      }
      return Promise.resolve({});
    },
    async onUploadFinish(_req, upload) {
      const uid = upload.metadata?.jobId;
      const filename = upload.metadata?.filename;
      const filepath = upload.storage?.path;

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
