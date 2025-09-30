import type { ProgressMessage } from "~/types/progress";

export type ProgressStreamer = ReturnType<typeof createProgressStreamer>;

export function createProgressStreamer(res: any) {
  const config = useRuntimeConfig();

  const write = (msg: ProgressMessage) => {
    if (res.writableEnded) {
      logger.error({
        service: "ProgressStreamer",
        message: "Attempted to write after response ended.",
      });
      return;
    }

    const json = JSON.stringify(msg) + "\n";

    if (config.tir_debug) {
      logger.debug({ service: "ProgressStreamer", message: `Streaming: ${json.trim()}` });
    }

    res.write(json);
  };

  return {
    status: (value: string) => write({ type: "status", value }),
    progress: (value: number) => write({ type: "progress", value }),
    saved: (value: number) => write({ type: "saved", value }),
    error: (value: string) => write({ type: "error", value }),
    complete: () => write({ type: "complete" }),
    raw: write,
  };
}
