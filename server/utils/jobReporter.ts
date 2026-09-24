import { DateTime } from "luxon";
import { jobEmitter } from "./jobEmitter";
import type { ProgressStreamer } from "./progressBar";
import { ImportJob } from "~/db/models";
import type { ProgressMessage } from "~/types/progress";

const PERSIST_INTERVAL_MS = 1000;

export function createJobReporter(uid: string): ProgressStreamer {
  let seq = 0;
  let lastPersistAt = 0;
  let pendingMessage: string | null = null;
  let pendingPercent: number | null = null;

  const emit = (msg: ProgressMessage) => {
    seq += 1;
    jobEmitter.emit(uid, { seq, msg });
  };

  const persist = async (fields: Record<string, unknown>) => {
    try {
      await ImportJob.update(
        { ...fields, lastUpdate: DateTime.now().toISO() },
        { where: { uid } },
      );
    } catch (error) {
      logger.error({ service: "ImportJob", message: `Failed to persist job ${uid}: ${error}` });
    }
  };

  const flushThrottled = (force: boolean) => {
    const now = Date.now();
    if (!force && now - lastPersistAt < PERSIST_INTERVAL_MS) return;
    if (pendingMessage === null && pendingPercent === null) return;

    const fields: Record<string, unknown> = {};
    if (pendingMessage !== null) fields.message = pendingMessage;
    if (pendingPercent !== null) fields.percent = pendingPercent;
    pendingMessage = null;
    pendingPercent = null;
    lastPersistAt = now;
    persist(fields).catch(() => {});
  };

  return {
    status: (value: string) => {
      emit({ type: "status", value });
      pendingMessage = value;
      flushThrottled(false);
    },
    progress: (value: number) => {
      emit({ type: "progress", value });
      pendingPercent = value;
      flushThrottled(value >= 100);
    },
    saved: (value: number) => {
      emit({ type: "saved", value });
      persist({ stigLibraryId: value }).catch(() => {});
    },
    error: (value: string) => {
      emit({ type: "error", value });
      persist({ status: "error", error: value }).catch(() => {});
    },
    complete: (value?: string, failed?: number) => {
      emit({ type: "complete", value, failed });
    },
    raw: emit,
    finish: () => {},
  };
}
