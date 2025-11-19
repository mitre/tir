import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Syslog, type SyslogTransportOptions } from "winston-syslog";
import { loadLogConfig, saveLogConfig } from "~/server/utils/config/logConfig";
import { LOG_SCHEMA, type LogConfig } from "~/types/log";

const SYSLOG_LEVELS = Object.keys(winston.config.syslog.levels);
const isValidLevel = (lvl?: string) => !!lvl && SYSLOG_LEVELS.includes(lvl.toLowerCase());
const normalizeLevel = (lvl?: string) => (isValidLevel(lvl) ? lvl!.toLowerCase() : "info");
const { Console } = winston.transports;

function changed<T>(a: T, b: T) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function diffConfig(prev: LogConfig | undefined, next: LogConfig) {
  if (!prev)
    return Object.keys(next).reduce(
      (m, k) => {
        m[k] = { from: undefined, to: (next as any)[k] };
        return m;
      },
      {} as Record<string, { from: any; to: any }>,
    );

  const d: Record<string, { from: any; to: any }> = {};
  for (const k of Object.keys(next) as (keyof LogConfig)[]) {
    if (changed(prev[k], next[k])) d[k as string] = { from: prev[k], to: next[k] };
  }
  return d;
}

const envConsoleLevel =
  process.env.NODE_ENV !== "production" && process.env.TIR_DEBUG?.toLowerCase() === "true"
    ? "debug"
    : undefined;

function buildDefaultConfig(partial?: Partial<LogConfig>): LogConfig {
  const base: LogConfig = {
    fileLogEnabled: LOG_SCHEMA.fileLogEnabled.default,
    syslogLogEnabled: LOG_SCHEMA.syslogLogEnabled.default,
    logPath: LOG_SCHEMA.logPath.default,
    syslogTarget: LOG_SCHEMA.syslogTarget.default,
    syslogPort: LOG_SCHEMA.syslogPort.default,
    consoleLogLevel: LOG_SCHEMA.consoleLogLevel.default,
    fileLogLevel: LOG_SCHEMA.fileLogLevel.default,
    syslogLogLevel: LOG_SCHEMA.syslogLogLevel.default,
    zipArchive: LOG_SCHEMA.zipArchive.default,
    maxSize: LOG_SCHEMA.maxSize.default,
    maxDays: LOG_SCHEMA.maxDays.default,
    levels: Object.keys(winston.config.syslog.levels),
  };

  const merged: LogConfig = {
    ...base,
    ...partial,
    consoleLogLevel: normalizeLevel(
      partial?.consoleLogLevel ?? envConsoleLevel ?? base.consoleLogLevel,
    ),
    fileLogLevel: normalizeLevel(partial?.fileLogLevel ?? base.fileLogLevel),
    syslogLogLevel: normalizeLevel(partial?.syslogLogLevel ?? base.syslogLogLevel),
  };

  merged.fileLogEnabled = false;
  merged.syslogLogEnabled = false;

  return merged;
}

export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format((info) => {
      const { timestamp, level, message, ...rest } = info;
      return { timestamp, level, message, ...rest };
    })(),
    winston.format.json({ deterministic: false }),
  ),
  transports: [
    new Console({
      format: winston.format.simple(),
      level: normalizeLevel(envConsoleLevel),
    }),
  ],
});

class LoggerService {
  private currentConfig?: LogConfig;

  get config(): LogConfig | undefined {
    return this.currentConfig;
  }

  bootstrap(partial?: Partial<LogConfig>): LogConfig {
    const cfg = buildDefaultConfig(partial);
    return this.applyConfig(cfg);
  }

  applyConfig(cfg: LogConfig): LogConfig {
    const prev = this.currentConfig;
    const diff = diffConfig(prev, cfg);

    if (Object.keys(diff).length) {
      logger.notice?.({
        service: "logger",
        message: "Applying logger config",
        changes: diff,
      });
    } else {
      logger.notice?.({ service: "logger", message: "Logger config unchanged; no updates." });
    }

    this.updateConsole(cfg);
    this.updateFile(cfg);
    this.updateSyslog(cfg);

    this.currentConfig = cfg;
    logger.notice?.({ service: "logger", message: "Logger transports reconfigured." });
    return cfg;
  }

  async reload(): Promise<LogConfig> {
    const cfg = await loadLogConfig();
    cfg.consoleLogLevel = normalizeLevel(cfg.consoleLogLevel);
    cfg.fileLogLevel = normalizeLevel(cfg.fileLogLevel);
    cfg.syslogLogLevel = normalizeLevel(cfg.syslogLogLevel);
    return this.applyConfig(cfg);
  }

  async savePartialAndReload(partial: Partial<LogConfig>): Promise<LogConfig> {
    await saveLogConfig(partial);
    return this.reload();
  }

  private updateConsole(setting: LogConfig) {
    const consoleTransport = logger.transports.find(
      (t): t is InstanceType<typeof Console> => t instanceof Console,
    );

    const newLevel = normalizeLevel(setting.consoleLogLevel);

    if (!consoleTransport) {
      logger.notice?.({ service: "logger", message: "Adding console transport." });
      logger.add(
        new Console({
          format: winston.format.simple(),
          level: newLevel,
        }),
      );
      return;
    }

    if (consoleTransport.level !== newLevel) {
      logger.notice?.({
        service: "logger",
        message: `Changing console level`,
        from: consoleTransport.level,
        to: newLevel,
      });
      consoleTransport.level = newLevel;
    }
  }

  private updateFile(settings: LogConfig) {
    const old = logger.transports.find((t) => t instanceof DailyRotateFile) as
      | DailyRotateFile
      | undefined;

    if (!settings.fileLogEnabled) {
      if (old) {
        logger.notice?.({
          service: "logger",
          message: "Disabling file logging; removing transport.",
        });
        logger.remove(old);
      }
      return;
    }

    const desired = {
      filename: "tir-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: !!settings.zipArchive,
      maxSize: `${settings.maxSize}m`,
      maxFiles: `${settings.maxDays}d`,
      dirname: settings.logPath,
      level: normalizeLevel(settings.fileLogLevel || "info"),
    };

    const same =
      !!old &&
      old.filename === desired.filename &&
      (old as any).options?.datePattern === desired.datePattern &&
      (old as any).options?.zippedArchive === desired.zippedArchive &&
      (old as any).options?.maxSize === desired.maxSize &&
      (old as any).options?.maxFiles === desired.maxFiles &&
      (old as any).dirname === desired.dirname &&
      old.level === desired.level;

    if (same) return;

    if (old) {
      logger.notice?.({
        service: "logger",
        message: "File log settings changed; replacing transport.",
      });
      logger.remove(old);
    } else {
      logger.notice?.({ service: "logger", message: "Enabling file logging; adding transport." });
    }

    const fileTransport = new DailyRotateFile(desired);

    fileTransport.on("new", (newFilename) => {
      const rolloverLogRegex = /\.\d{1,3}\.(log|gz)$/;
      if (rolloverLogRegex.test(newFilename)) {
        logger.warning?.({
          service: "logger",
          message: `Max log size reached; created ${newFilename}`,
        });
      } else {
        logger.notice?.({ service: "logger", message: `Created new log file ${newFilename}` });
      }
    });

    logger.add(fileTransport);
  }

  private updateSyslog(settings: LogConfig) {
    const old = logger.transports.find(
      (t): t is InstanceType<typeof Syslog> => t instanceof Syslog,
    );
    if (!settings.syslogLogEnabled) {
      if (old) {
        logger.notice?.({ service: "logger", message: "Disabling syslog; removing transport." });
        logger.remove(old);
      }
      return;
    }

    const options: SyslogTransportOptions = {
      host: settings.syslogTarget,
      port: settings.syslogPort,
      protocol: "udp4",
      app_name: "TIR",
    };
    const level = normalizeLevel(settings.syslogLogLevel || "info");

    const needsReplace =
      !old ||
      (old as any)._options?.host !== options.host ||
      (old as any)._options?.port !== options.port ||
      (old as any).level !== level;

    if (!needsReplace) return;

    if (old) {
      logger.notice?.({
        service: "logger",
        message: "Syslog settings changed; replacing transport.",
      });
      logger.remove(old);
    } else {
      logger.notice?.({ service: "logger", message: "Enabling syslog; adding transport." });
    }

    const sys = new Syslog(options);
    (sys as any).level = level;
    logger.add(sys);
  }
}

export const Logger = new LoggerService();

export function applyLoggerFromConfig(): Promise<LogConfig> {
  return Logger.reload();
}
export function saveAndApplyLoggerConfig(partial: Partial<LogConfig>): Promise<LogConfig> {
  return Logger.savePartialAndReload(partial);
}
