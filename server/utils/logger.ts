import * as winston from "winston";

// const config = useRuntimeConfig();

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
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export const databaseLogger = logger.child({ service: "database" });
export const importLibraryLogger = logger.child({ service: "importLibrary" });
