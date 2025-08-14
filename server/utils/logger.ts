import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { SyslogTransportOptions, Syslog } from "winston-syslog";
import { TirConfig } from "~/db/models/tirConfig";
import * as configUtil from "~/server/utils/tirConfig";

const config = useRuntimeConfig();
const defaultConsoleLogLevel = config.tir_debug.toLowerCase() === "true" ? "debug" : "info";

const logConfigPrefix = "logger";

export type LogConfig = {
  fileLogEnabled: boolean;
  syslogLogEnabled: boolean;
  logPath?: string;
  syslogTarget?: string;
  syslogPort?: number;
  consoleLogLevel?: string;
  fileLogLevel?: string;
  syslogLogLevel?: string;
  zipArchive?: boolean;
  maxSize?: number;
  maxDays?: number;
};

const defaultLogConfig: LogConfig = {
  fileLogEnabled: true,
  syslogLogEnabled: false,
  logPath: "tmp",
  fileLogLevel: "info",
  syslogLogLevel: "info",
  zipArchive: false,
  maxSize: 10,
  maxDays: 7,
};

export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: "info",
  // format: winston.format.json(),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format((info) => {
      const { timestamp, level, message, ...rest } = info;
      return {
        timestamp,
        level,
        message,
        ...rest,
      };
    })(),
    winston.format.json({ deterministic: false }),
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
      level: defaultConsoleLogLevel,
    }),
  ],
});

function getBoolValue(logConfig: TirConfig[], valName: string): boolean | undefined {
  return configUtil.getBoolValue(logConfig, logConfigPrefix, valName);
}
function getStringValue(logConfig: TirConfig[], valName: string): string | undefined {
  return configUtil.getStringValue(logConfig, logConfigPrefix, valName);
}
function getNumValue(logConfig: TirConfig[], valName: string): number | undefined {
  return configUtil.getNumValue(logConfig, logConfigPrefix, valName);
}

export async function getLogConfig(): Promise<LogConfig> {
  const logConfig = await configUtil.getConfigValues(logConfigPrefix);

  if (!logConfig) {
    return defaultLogConfig;
  }

  return {
    fileLogEnabled: getBoolValue(logConfig, "fileLogEnabled") ?? defaultLogConfig.fileLogEnabled,
    syslogLogEnabled:
      getBoolValue(logConfig, "syslogLogEnabled") ?? defaultLogConfig.syslogLogEnabled,
    logPath: getStringValue(logConfig, "logPath") ?? defaultLogConfig.logPath,
    syslogTarget: getStringValue(logConfig, "syslogTarget"),
    syslogPort: getNumValue(logConfig, "syslogPort"),
    consoleLogLevel:
      getStringValue(logConfig, "consoleLogLevel") ?? defaultLogConfig.consoleLogLevel,
    fileLogLevel: getStringValue(logConfig, "fileLogLevel") ?? defaultLogConfig.fileLogLevel,
    syslogLogLevel: getStringValue(logConfig, "syslogLogLevel"),
    zipArchive: getBoolValue(logConfig, "zipArchive") ?? defaultLogConfig.zipArchive,
    maxSize: getNumValue(logConfig, "maxSize") ?? defaultLogConfig.maxSize,
    maxDays: getNumValue(logConfig, "maxDays") ?? defaultLogConfig.maxDays,
  };
}

export async function setLogValue<T extends boolean | string | number>(
  valName: string,
  value: T,
): Promise<void> {
  logger.notice({
    service: "config",
    message: `Config ${valName} has been changed to ${value}`,
  });
  await configUtil.setValue(logConfigPrefix, valName, value);
}

export function updateFileLogging(settings: LogConfig) {
  const fileTransport = new DailyRotateFile({
    filename: "tir-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: settings.zipArchive,
    maxSize: `${settings.maxSize}m`,
    maxFiles: `${settings.maxDays}d`,
    dirname: settings.logPath,
  });

  fileTransport.on("new", (newFilename) => {
    if (settings.fileLogEnabled) {
      const rolloverLogRegex = /\.\d{1,3}\.(log|gz)$/;
      if (rolloverLogRegex.test(newFilename)) {
        logger.warning(`Max log file size reached. Created new File ${newFilename}.`);
      } else {
        logger.notice(`A new log file has been created: ${newFilename}`);
      }
    }
  });

  const oldFileTransport = logger.transports.find(
    (transport) => transport instanceof DailyRotateFile,
  );

  if (oldFileTransport) {
    logger.notice(`Log file settings have been changed.  Stopping Log File.`);
    logger.remove(oldFileTransport);
  }

  if (settings.fileLogEnabled) {
    logger.add(fileTransport);
    logger.notice({ service: "logger", message: `New log settings applied.` });
  }
}

export function updateSyslogLogging(settings: LogConfig) {
  const options: SyslogTransportOptions = {
    host: settings.syslogTarget,
    port: settings.syslogPort,
    protocol: "udp4",
    app_name: "TIR",
  };

  const oldSyslogTransport = logger.transports.find((transport) => transport instanceof Syslog);

  if (oldSyslogTransport) {
    logger.notice(`Syslog settings have been changed.  Stopping Syslog Transport.`);

    logger.remove(oldSyslogTransport);
  }

  if (settings.syslogLogEnabled) {
    logger.add(new Syslog(options));
    logger.notice(`New syslog settings applied. Started Syslog Transport`);
  }
}

export function updateConsoleLogging(setting: LogConfig) {
  const consoleTransport = logger.transports.find(
    (transport) => transport instanceof winston.transports.Console,
  );
  if (consoleTransport) {
    logger.notice({
      service: "logger",
      message: `Changing console logging level to ${setting.consoleLogLevel}`,
    });
    consoleTransport.level = setting.consoleLogLevel;
    logger.notice({
      service: "logger",
      message: `Console logging level changed to ${setting.consoleLogLevel}`,
    });
  }
}
