import * as fs from "fs";
import * as winston from "winston";
import { SyslogTransportOptions, Syslog } from "winston-syslog";

const logConfigPath = "config/logConfig.json";
const configAvailable = checkLogs(logConfigPath);

let logPath = "tmp";

if (configAvailable) {
  const fileContent = fs.readFileSync(logConfigPath, "utf-8");
  const logConfig = JSON.parse(fileContent);
  logPath = logConfig.logPath;
}

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
    new winston.transports.File({ filename: `${logPath}/error.log`, level: "error" }),
    new winston.transports.File({ filename: `${logPath}/combined.log` }),
  ],
});

// if (process.env.NODE_ENV !== "production") {
logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
);
// }

if (configAvailable) {
  const fileContent = fs.readFileSync(logConfigPath, "utf-8");
  const logConfig = JSON.parse(fileContent);

  if (logConfig.syslogTarget && logConfig.syslogPort) {
    const opt: SyslogTransportOptions = {
      host: logConfig.syslogTarget,
      port: logConfig.syslogPort,
      protocol: "udp4",
      app_name: "TIR",
      // eol: '\n'
    };

    logger.add(new Syslog(opt));
  }
}

function checkLogs(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.accessSync(filePath, fs.constants.R_OK);
      fs.accessSync(filePath, fs.constants.W_OK);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export const databaseLogger = logger.child({ service: "database" });
export const importLibraryLogger = logger.child({ service: "importLibrary" });
