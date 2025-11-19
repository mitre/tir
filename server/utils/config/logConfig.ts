import * as winston from "winston";
import { getConfigValues, setConfigValue } from "~/server/utils/config/tirConfig";
import { LOG_SCHEMA, type LogConfig } from "~/types/log";

const SECTION = "log";
const SYSLOG_LEVELS = Object.keys(winston.config.syslog.levels);

export async function loadLogConfig(): Promise<LogConfig> {
  const raw = await getConfigValues(SECTION);
  const cfg: Partial<LogConfig> = {};

  for (const [key, spec] of Object.entries(LOG_SCHEMA)) {
    const v = raw[key];
    switch (spec.type) {
      case "bool":
        (cfg as any)[key] = v === "true" || v === "1";
        break;
      case "num":
        (cfg as any)[key] = Number(v ?? spec.default);
        break;
      case "str":
        (cfg as any)[key] = v ?? spec.default;
        break;
    }
  }

  (cfg as LogConfig).levels = SYSLOG_LEVELS;

  return cfg as LogConfig;
}

export async function saveLogConfig(partial: Partial<LogConfig>): Promise<void> {
  const ops: Promise<any>[] = [];
  for (const key of Object.keys(LOG_SCHEMA) as (keyof LogConfig)[]) {
    const val = partial[key];
    if (val === undefined || key === "levels") continue; // ignore helper field
    ops.push(setConfigValue(SECTION, key, val));
  }
  await Promise.all(ops);
}
