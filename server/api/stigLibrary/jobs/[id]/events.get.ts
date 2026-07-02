import { ImportJob } from "~/db/models";
import { jobEmitter, type JobEvent } from "~/server/utils/jobEmitter";
import type { ProgressMessage } from "~/types/progress";

export default defineEventHandler(async (event) => {
  await userCheck(event, undefined, undefined, undefined);

  const uid = getRouterParam(event, "id");
  const job = await ImportJob.findOne({ where: { uid } });

  setResponseHeader(event, "X-Accel-Buffering", "no");
  setResponseHeader(event, "Cache-Control", "no-cache, no-transform");

  const stream = createEventStream(event);
  const closeSoon = () => setTimeout(() => stream.close().catch(() => {}), 50);

  // EventSource retries forever on a 404, so signal "job gone" as a normal
  // event and close the stream instead of returning an error status.
  if (!job) {
    stream.push(JSON.stringify({ type: "error", value: "Import job not found." })).catch(() => {});
    closeSoon();
    return stream.send();
  }

  const terminal = job.status === "done" || job.status === "error";

  const replay: ProgressMessage[] = [];
  if (job.message) replay.push({ type: "status", value: job.message });
  if (job.stigLibraryId) replay.push({ type: "saved", value: job.stigLibraryId });
  replay.push({ type: "progress", value: job.percent });
  if (job.status === "done") replay.push({ type: "complete" });
  if (job.status === "error") replay.push({ type: "error", value: job.error || "Import failed." });

  const listener = (payload: JobEvent) => {
    stream.push({ id: String(payload.seq), data: JSON.stringify(payload.msg) }).catch(() => {});
    if (payload.msg.type === "complete" || payload.msg.type === "error") {
      closeSoon();
    }
  };

  if (!terminal) {
    jobEmitter.on(uid as string, listener);
  }

  stream.onClosed(() => {
    jobEmitter.off(uid as string, listener);
  });

  const replayState = async () => {
    for (const msg of replay) {
      await stream.push(JSON.stringify(msg));
    }
    if (terminal) closeSoon();
  };
  replayState().catch(() => {});

  return stream.send();
});
