import { EventEmitter } from "node:events";
import type { ProgressMessage } from "~/types/progress";

export type JobEvent = { seq: number; msg: ProgressMessage };

export const jobEmitter = new EventEmitter();
jobEmitter.setMaxListeners(0);
